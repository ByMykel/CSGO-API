#!/usr/bin/env node
/**
 * Run unchanged upstream generators in a DISPOSABLE upstream directory.
 * en/zh-CN are copied exactly. Other locales are rebuilt from clean directories.
 * This runner never invokes update.js/group.js or their manifest cache/API calls.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditTemplates, EXPECTED_LOCALES, resolveLocales } from './validate.mjs';

export const LOCALES = EXPECTED_LOCALES;
const MIRRORED = new Set(['en', 'zh-CN']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function within(parent, child) {
  return child === parent || child.startsWith(`${parent}${path.sep}`);
}

/** Parse the narrow upstream runner contract; changed control flow fails closed. */
export function discoverGenerators(text) {
  const imports = new Map();
  const importPattern = /import\s*\{([^}]+)\}\s*from\s*["'](\.\/services\/[A-Za-z][A-Za-z0-9]*\.js)["']\s*;/g;
  for (const match of text.matchAll(importPattern)) {
    for (const rawName of match[1].split(',')) {
      const name = rawName.trim();
      assert(/^[A-Za-z_$][\w$]*$/.test(name), `Unsupported upstream import: ${rawName}`);
      assert(!imports.has(name), `Duplicate upstream import: ${name}`);
      imports.set(name, match[2]);
    }
  }
  const blocks = [...text.matchAll(/await\s+loadTranslations\s*\(\s*language\s*\)\s*;([\s\S]*?)\}\s*catch\s*\(/g)];
  assert(blocks.length === 1, 'Unsupported upstream update.js: cannot identify one locale-generation block');
  const statements = blocks[0][1].split(';').map(s => s.trim()).filter(Boolean);
  const generators = statements.map(statement => {
    const match = /^(?:await\s+)?(get[A-Z]\w*)\s*\(\s*\)$/.exec(statement);
    assert(match, `Unsupported upstream generation statement: ${statement.slice(0, 120)}`);
    assert(imports.has(match[1]), `Generator ${match[1]} has no supported service import`);
    return { name: match[1], module: imports.get(match[1]) };
  });
  const names = generators.map(item => item.name);
  assert(names.length > 1 && new Set(names).size === names.length, 'Empty or duplicate upstream generator list');
  assert(names.at(-1) === 'getInventory', 'Upstream inventory must remain the final generator');
  for (const [name, module] of imports) {
    if (/^get[A-Z]/.test(name) && !['./services/main.js', './services/translations.js'].includes(module)) {
      assert(names.includes(name), `Upstream service ${name} is imported but not recognized in generation block`);
    }
  }
  return generators;
}

export function discoverGroupInputs(text) {
  const match = /const\s+inputFilePathsTemplate\s*=\s*\[([\s\S]*?)\]\s*;/.exec(text);
  assert(match, 'Unsupported upstream group.js: missing inputFilePathsTemplate');
  const paths = [...match[1].matchAll(/["'](\.\/public\/api\/\{lang\}\/([A-Za-z0-9_-]+\.json))["']/g)];
  const residue = match[1].replace(/["']\.\/public\/api\/\{lang\}\/[A-Za-z0-9_-]+\.json["']/g, '').replace(/[\s,]/g, '');
  assert(paths.length > 0 && residue === '', 'Unsupported upstream group inputs; review upstream changes');
  const files = paths.map(item => item[2]);
  assert(new Set(files).size === files.length && !files.includes('all.json'), 'Duplicate or recursive upstream group inputs');
  return files;
}

/** Track callback writes even when upstream functions forget to return their Promise. */
export function trackWrites(allowedDirectory) {
  const original = fs.writeFile;
  const pending = new Set();
  const failures = [];
  fs.writeFile = function trackedWrite(file, data, options, callback) {
    const cb = typeof options === 'function' ? options : callback;
    assert(typeof cb === 'function', 'Unsupported upstream fs.writeFile without callback');
    const target = path.resolve(String(file));
    assert(within(allowedDirectory, target), `Upstream attempted writing outside current locale: ${target}`);
    let complete;
    const tracked = new Promise(resolve => { complete = resolve; });
    pending.add(tracked);
    const wrapped = error => {
      if (error) failures.push(error);
      try { cb(error); } catch (callbackError) { failures.push(callbackError); }
      pending.delete(tracked);
      complete();
    };
    try {
      if (typeof options === 'function') original.call(fs, file, data, wrapped);
      else original.call(fs, file, data, options, wrapped);
    } catch (error) {
      wrapped(error);
    }
  };
  syncBuiltinESMExports();
  return {
    async drain() {
      while (pending.size) await Promise.all([...pending]);
      if (failures.length) throw new AggregateError(failures.splice(0), 'Upstream output writes failed');
    },
    restore() { fs.writeFile = original; syncBuiltinESMExports(); },
  };
}

async function jsonFiles(directory) {
  const entries = await fsp.readdir(directory, { withFileTypes: true });
  assert(entries.every(entry => entry.isFile() && entry.name.endsWith('.json')), `Unexpected entry in API directory ${directory}`);
  return entries.map(entry => entry.name).sort();
}

async function fileDigests(directory, files) {
  const values = await Promise.all(files.map(async name => [name, createHash('sha256').update(await fsp.readFile(path.join(directory, name))).digest('hex')]));
  return Object.fromEntries(values);
}

/** Dictionary coverage only: these counts are not claims about output completeness. */
export async function auditLocalizationSources(fileTracker, languages) {
  if (!fileTracker) return { status: 'not-collected', reason: 'Local game localization snapshots were not supplied.' };
  const dictionaries = new Map();
  for (const language of languages) {
    const name = new URL(language.url).pathname.split('/').at(-1);
    assert(/^csgo_[A-Za-z0-9_]+\.json$/.test(name), `Unsupported localization filename for ${language.folder}`);
    const data = JSON.parse(await fsp.readFile(path.join(fileTracker, 'static', name), 'utf8'));
    const tokens = data?.lang?.Tokens;
    assert(tokens && typeof tokens === 'object' && !Array.isArray(tokens), `Invalid localization Tokens object for ${language.folder}`);
    dictionaries.set(language.folder, Object.fromEntries(Object.entries(tokens).map(([key, value]) => [key.toLowerCase(), value])));
  }
  const english = dictionaries.get('en');
  assert(english && Object.keys(english).length > 0, 'Missing English localization dictionary baseline');
  const englishKeys = Object.keys(english);
  const locales = {};
  for (const [code, tokens] of dictionaries) {
    const missing = englishKeys.filter(key => !Object.hasOwn(tokens, key));
    const falsy = englishKeys.filter(key => Object.hasOwn(tokens, key) && !tokens[key]);
    const potentialFallbacks = englishKeys.filter(key => !tokens[key] && Boolean(english[key]));
    const values = Object.values(tokens);
    locales[code] = {
      sourceTokens: Object.keys(tokens).length,
      englishBaselineTokens: englishKeys.length,
      englishKeysPresent: englishKeys.length - missing.length,
      missingEnglishKeys: missing.length,
      presentButFalsyEnglishKeys: falsy.length,
      potentialEnglishFallbackKeys: potentialFallbacks.length,
      valuesIdenticalToEnglish: englishKeys.filter(key => Boolean(tokens[key]) && tokens[key] === english[key]).length,
      nonStringSourceValues: values.filter(value => typeof value !== 'string').length,
      valuesWithControlCharacters: values.filter(value => typeof value === 'string' && /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(value)).length,
      missingKeySample: missing.slice(0, 12),
      falsyKeySample: falsy.slice(0, 12),
    };
  }
  return {
    status: 'dictionary-coverage-only',
    detail: 'Counts cover full game dictionaries, including UI tokens unused by this API. Potential English fallback keys follow upstream truthy-value lookup; actual API fallback use is not measured. Identical English strings can be legitimate names and do not establish missing translation. Spelling is not certified.',
    locales,
  };
}

/** Replace only axios transport, leaving upstream parsers and TLS defaults intact. */
async function useSnapshots(source, fileTracker, imageTracker) {
  if (!fileTracker && !imageTracker) return { mode: 'upstream-network', files: {}, restore() {} };
  assert(fileTracker && imageTracker, 'Provide both --file-tracker and --image-tracker');
  const requireFromSource = createRequire(path.join(source, 'package.json'));
  const packageFile = requireFromSource.resolve('axios/package.json');
  const { default: axios } = await import(pathToFileURL(path.join(path.dirname(packageFile), 'index.js')).href);
  const originalAdapter = axios.defaults.adapter;
  const files = {};
  axios.defaults.adapter = async config => {
    const url = new URL(config.url, config.baseURL);
    assert((config.method || 'get').toLowerCase() === 'get', `Unsupported upstream HTTP method for ${url}`);
    let repo;
    let relative;
    let api = false;
    if (url.hostname === 'raw.githubusercontent.com') {
      const match = /^\/ByMykel\/(counter-strike-file-tracker|counter-strike-image-tracker)\/(?:refs\/heads\/)?[^/]+\/(static\/[A-Za-z0-9_.-]+)$/.exec(url.pathname);
      assert(match, `Unsupported upstream raw URL: ${url}`);
      [, repo, relative] = match;
    } else if (url.hostname === 'api.github.com') {
      const match = /^\/repos\/ByMykel\/(counter-strike-file-tracker|counter-strike-image-tracker)\/contents\/(static\/[A-Za-z0-9_.-]+)$/.exec(url.pathname);
      assert(match, `Unsupported upstream API URL: ${url}`);
      [, repo, relative] = match;
      api = true;
    } else throw new Error(`Unexpected network destination in snapshot mode: ${url}`);
    const root = repo === 'counter-strike-file-tracker' ? fileTracker : imageTracker;
    const bytes = await fsp.readFile(path.join(root, relative));
    files[`${repo}/${relative}`] = createHash('sha256').update(bytes).digest('hex');
    const data = api ? JSON.stringify({
      content: bytes.toString('base64'),
      sha: createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex'),
    }) : bytes.toString('utf8');
    return { data, status: 200, statusText: 'OK', headers: { 'content-type': 'application/json' }, config, request: { localSnapshot: true } };
  };
  return { mode: 'pinned-local-snapshots', files, restore() { axios.defaults.adapter = originalAdapter; } };
}

async function buildAll(directory, inputFiles) {
  const all = {};
  for (const name of inputFiles) {
    const values = JSON.parse(await fsp.readFile(path.join(directory, name), 'utf8'));
    assert(Array.isArray(values), `Group input ${name} is not an array`);
    for (const value of values) {
      assert(value && typeof value.id === 'string' && value.id.length > 0, `Invalid item ID in ${name}`);
      assert(!Object.hasOwn(all, value.id), `Duplicate grouped item ID ${value.id}`);
      all[value.id] = value;
    }
  }
  await fsp.writeFile(path.join(directory, 'all.json'), JSON.stringify(all));
}

async function moveDirectory(source, destination) {
  try {
    await fsp.rename(source, destination);
  } catch (error) {
    if (error.code !== 'EXDEV') throw error;
    // /tmp and the output mount can be separate filesystems during local use.
    await fsp.cp(source, destination, { recursive: true, errorOnExist: true, force: false });
    await fsp.rm(source, { recursive: true });
  }
}

export async function generate({ source, output, fileTracker, imageTracker, languages: selectedLanguages }) {
  const locales = resolveLocales(selectedLanguages);
  for (const [name, value] of Object.entries({ source, output, fileTracker, imageTracker })) {
    if (value !== undefined) assert(path.isAbsolute(value), `${name} must be an absolute path`);
  }
  assert(source && output, 'Required options: --source /absolute/disposable/upstream --output /absolute/staging');
  source = await fsp.realpath(source);
  output = path.resolve(output);
  assert(source !== path.parse(source).root && output !== path.parse(output).root, 'Refusing a filesystem root');
  assert(!within(source, output) && !within(output, source), 'Source and output must be separate directories');
  if (fileTracker) fileTracker = await fsp.realpath(fileTracker);
  if (imageTracker) imageTracker = await fsp.realpath(imageTracker);
  await fsp.mkdir(output, { recursive: true });
  assert((await fsp.readdir(output)).length === 0, 'Output staging must be empty; refusing to overwrite existing files');
  const templates = await auditTemplates(source);
  const generators = discoverGenerators(await fsp.readFile(path.join(source, 'update.js'), 'utf8'));
  const groupInputs = discoverGroupInputs(await fsp.readFile(path.join(source, 'group.js'), 'utf8'));
  const referenceApi = path.join(source, 'public/api');
  const required = await jsonFiles(path.join(referenceApi, 'en'));
  assert(required.includes('all.json') && required.includes('inventory.json'), 'Upstream is missing required all/inventory endpoints');
  assert(JSON.stringify(await jsonFiles(path.join(referenceApi, 'zh-CN'))) === JSON.stringify(required), 'Upstream en and zh-CN endpoint sets differ');
  assert(groupInputs.every(name => required.includes(name)), 'Group inputs do not match upstream endpoints');
  const mirroredDigests = {};
  for (const code of MIRRORED) mirroredDigests[code] = await fileDigests(path.join(referenceApi, code), required);
  const { LANGUAGES_URL } = await import(pathToFileURL(path.join(source, 'constants.js')).href);
  assert(Array.isArray(LANGUAGES_URL), 'Unsupported upstream LANGUAGES_URL');
  const languages = locales.map(code => {
    const matches = LANGUAGES_URL.filter(language => language.folder === code);
    assert(matches.length === 1, `Missing or duplicate upstream locale ${code}`);
    assert(typeof matches[0].url === 'string' && typeof matches[0].language === 'string', `Invalid upstream locale ${code}`);
    return matches[0];
  });
  const localizationSources = await auditLocalizationSources(fileTracker, languages);
  const transport = await useSnapshots(source, fileTracker, imageTracker);
  const originalCwd = process.cwd();
  const generated = [];
  const api = path.join(output, 'api');
  await fsp.mkdir(api);
  let writes;
  try {
    process.chdir(source);
    const { loadData } = await import(pathToFileURL(path.join(source, 'services/main.js')).href);
    const { loadTranslations } = await import(pathToFileURL(path.join(source, 'services/translations.js')).href);
    assert(typeof loadData === 'function' && typeof loadTranslations === 'function', 'Unsupported upstream loader exports');
    const steps = [];
    for (const descriptor of generators) {
      const module = await import(pathToFileURL(path.join(source, descriptor.module)).href);
      assert(typeof module[descriptor.name] === 'function', `Missing upstream export ${descriptor.name}`);
      steps.push({ ...descriptor, run: module[descriptor.name] });
    }
    await loadData();
    for (const language of languages.filter(item => !MIRRORED.has(item.folder))) {
      const directory = path.join(referenceApi, language.folder);
      await fsp.rm(directory, { recursive: true, force: true });
      await fsp.mkdir(directory, { recursive: true });
      console.log(`Generating ${language.folder} (${language.language})`);
      writes = trackWrites(directory);
      try {
        await loadTranslations(language);
        for (const step of steps) {
          await step.run();
          await writes.drain();
        }
      } finally {
        await writes.drain();
        writes.restore();
        writes = undefined;
      }
      await buildAll(directory, groupInputs);
      const produced = await jsonFiles(directory);
      assert(JSON.stringify(produced) === JSON.stringify(required), `Generated endpoint set differs for ${language.folder}: ${produced.join(', ')}`);
      for (const file of produced) JSON.parse(await fsp.readFile(path.join(directory, file), 'utf8'));
      // Keep only one full copy of large generated locale trees on the runner.
      await moveDirectory(directory, path.join(api, language.folder));
      generated.push(language.folder);
    }
    for (const code of MIRRORED) {
      const after = await fileDigests(path.join(referenceApi, code), required);
      assert(JSON.stringify(after) === JSON.stringify(mirroredDigests[code]), `Upstream ${code} unexpectedly changed during generation`);
    }
    for (const code of MIRRORED) await fsp.cp(path.join(referenceApi, code), path.join(api, code), { recursive: true, errorOnExist: true, force: false });
    const report = {
      locales,
      mirrored: [...MIRRORED],
      generated,
      endpoints: required,
      generators: generators.map(item => item.name),
      groupInputs,
      templateAudit: templates,
      localizationSources,
      inputMode: transport.mode,
      inputFileSha256: transport.files,
      mirroredFileSha256: mirroredDigests,
      spelling: { status: 'not-certified', source: 'Upstream game localization and existing upstream templates; native-language spelling review was not performed.' },
      notes: [
        'es-MX uses upstream Latin American Spanish (latam).',
        'no uses upstream Norwegian (norwegian).',
        'Upstream translation lookup retains its English fallback for unavailable tokens.',
        'Market names, machine enums and upstream special_notes may remain English.',
      ],
    };
    await fsp.writeFile(path.join(output, 'generation-report.json'), `${JSON.stringify(report, null, 2)}\n`);
    return report;
  } finally {
    if (writes) writes.restore();
    transport.restore();
    process.chdir(originalCwd);
  }
}

function parseArgs(args) {
  const names = new Map([['--source', 'source'], ['--output', 'output'], ['--file-tracker', 'fileTracker'], ['--image-tracker', 'imageTracker'], ['--languages', 'languages']]);
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = names.get(args[index]);
    assert(key && args[index + 1] && !args[index + 1].startsWith('--'), `Unknown or incomplete option ${args[index]}`);
    assert(options[key] === undefined, `Repeated option ${args[index]}`);
    options[key] = args[index + 1];
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generate(parseArgs(process.argv.slice(2))).then(
    report => console.log(`Generated ${report.locales.length} locales with ${report.endpoints.length} endpoints each.`),
    error => { console.error(error.stack || error); process.exitCode = 1; },
  );
}
