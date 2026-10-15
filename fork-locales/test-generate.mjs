import test from 'node:test';
import assert from 'node:assert/strict';
import * as esmFs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { auditLocalizationSources, discoverGenerators, discoverGroupInputs, generate, LOCALES, trackWrites } from './generate.mjs';
import { SUPPORTED_LOCALES, validateOutputs } from './validate.mjs';

const runner = `
import { loadData, getManifestId } from './services/main.js';
import { loadTranslations } from './services/translations.js';
import { getAgents } from './services/agents.js';
import { getInventory } from './services/inventory.js';
try {
 await loadTranslations(language);
 getAgents();
 getInventory();
} catch (error) {}
`;

test('discovers new category generators while requiring inventory last', () => {
  assert.deepEqual(discoverGenerators(runner).map(item => item.name), ['getAgents', 'getInventory']);
  const extended = runner.replace('try {', "import { getPets } from './services/pets.js';\ntry {").replace('getAgents();', 'getAgents(); getPets();');
  assert.deepEqual(discoverGenerators(extended).map(item => item.name), ['getAgents', 'getPets', 'getInventory']);
  assert.throws(() => discoverGenerators(runner.replace('getAgents();\n getInventory();', 'getInventory();\n getAgents();')), /final generator/);
});

test('refuses changed generation control flow and unknown imported category functions', () => {
  assert.throws(() => discoverGenerators(runner.replace('getAgents();', 'if (enabled) getAgents();')), /Unsupported upstream generation statement/);
  assert.throws(() => discoverGenerators(runner.replace('try {', "import { getPets } from './services/pets.js';\ntry {")), /imported but not recognized/);
});

test('reads upstream grouping inputs without executing upstream cache/API code', () => {
  assert.deepEqual(discoverGroupInputs('const inputFilePathsTemplate = ["./public/api/{lang}/agents.json", "./public/api/{lang}/pets.json",];'), ['agents.json', 'pets.json']);
  assert.throws(() => discoverGroupInputs('const inputFilePathsTemplate = ["./public/api/{lang}/agents.json", ...additional];'), /Unsupported upstream group inputs/);
  assert.throws(() => discoverGroupInputs('const inputFilePathsTemplate = ["./public/api/{lang}/all.json"];'), /recursive/);
});

test('drains fs callback writes omitted from generator return values', async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'csgo-write-test-'));
  const originalWrite = esmFs.writeFile;
  const writes = trackWrites(directory);
  let callbackFinished = false;
  try {
    // Mirrors upstream saveDataJson callers that do not return their write Promise.
    esmFs.writeFile(path.join(directory, 'agents.json'), '[{"id":"agent-1"}]', error => {
      assert.ifError(error);
      callbackFinished = true;
    });
    await writes.drain();
    assert.equal(callbackFinished, true);
    assert.equal(await fsp.readFile(path.join(directory, 'agents.json'), 'utf8'), '[{"id":"agent-1"}]');
    assert.throws(() => esmFs.writeFile(path.join(directory, '..', 'outside.json'), 'bad', () => {}), /outside current locale/);
  } finally {
    writes.restore();
    assert.equal(esmFs.writeFile, originalWrite);
    await fsp.rm(directory, { recursive: true, force: true });
  }
});

test('write errors propagate even when a generator ignores callbacks', async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'csgo-write-error-test-'));
  const writes = trackWrites(directory);
  let callbackError;
  try {
    esmFs.writeFile(path.join(directory, 'missing', 'agents.json'), '[]', error => { callbackError = error; });
    await assert.rejects(writes.drain(), /Upstream output writes failed/);
    assert.equal(callbackError.code, 'ENOENT');
  } finally {
    writes.restore();
    await fsp.rm(directory, { recursive: true, force: true });
  }
});

test('reports possible dictionary fallbacks without calling identical proper names untranslated', async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'csgo-source-audit-'));
  try {
    await fsp.mkdir(path.join(directory, 'static'));
    await fsp.writeFile(path.join(directory, 'static/csgo_english.json'), JSON.stringify({ lang: { Tokens: { Item: 'Valve', Missing: 'New item', Empty: 'Description' } } }));
    await fsp.writeFile(path.join(directory, 'static/csgo_french.json'), JSON.stringify({ lang: { Tokens: { ITEM: 'Valve', Empty: '' } } }));
    const report = await auditLocalizationSources(directory, [
      { folder: 'en', url: 'https://example.test/static/csgo_english.json' },
      { folder: 'fr', url: 'https://example.test/static/csgo_french.json' },
    ]);
    assert.equal(report.status, 'dictionary-coverage-only');
    assert.equal(report.locales.fr.missingEnglishKeys, 1);
    assert.equal(report.locales.fr.presentButFalsyEnglishKeys, 1);
    assert.equal(report.locales.fr.potentialEnglishFallbackKeys, 2);
    assert.equal(report.locales.fr.valuesIdenticalToEnglish, 1);
    assert.deepEqual(report.locales.fr.missingKeySample, ['missing']);
    assert.match(report.detail, /actual API fallback use is not measured/);
  } finally {
    await fsp.rm(directory, { recursive: true, force: true });
  }
});


async function generationFixture(t) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'csgo-batch-generate-'));
  t.after(() => fsp.rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');
  await fsp.mkdir(path.join(source, 'utils'), { recursive: true });
  await fsp.mkdir(path.join(source, 'services'));
  const save = (file, text) => fsp.writeFile(path.join(source, file), text);
  await save('package.json', JSON.stringify({ type: 'module' }));
  await save('utils/translations.json', JSON.stringify(Object.fromEntries(SUPPORTED_LOCALES.map(code => [code, { name: '{item_name}' }]))));
  await save('constants.js', `export const LANGUAGES_URL = ${JSON.stringify(SUPPORTED_LOCALES.map(code => ({ folder: code, language: code, url: `https://example.test/csgo_${code.replace('-', '_')}.json` })))};`);
  await save('update.js', runner);
  await save('group.js', 'const inputFilePathsTemplate = ["./public/api/{lang}/agents.json"];');
  await save('services/main.js', 'export async function loadData() {}');
  await save('services/state.js', 'export let code; export function setCode(value) { code = value; }');
  await save('services/translations.js', "import {setCode} from './state.js'; export async function loadTranslations(language) {setCode(language.folder);}");
  await save('services/agents.js', `import fs from 'node:fs'; import {code} from './state.js'; export function getAgents() {fs.writeFile('./public/api/' + code + '/agents.json', JSON.stringify([{id:'agent-1',name:code,image:'fixed'}]), error => {if(error) throw error;});}`);
  await save('services/inventory.js', `import fs from 'node:fs'; import {code} from './state.js'; export function getInventory() {fs.writeFile('./public/api/' + code + '/inventory.json', JSON.stringify({agent:{name:code,image:'fixed'}}), error => {if(error) throw error;});}`);
  for (const code of ['en', 'zh-CN']) {
    const directory = path.join(source, 'public/api', code);
    await fsp.mkdir(directory, { recursive: true });
    const agent = { id: 'agent-1', name: code, image: 'fixed' };
    for (const [filename, value] of Object.entries({ 'agents.json': [agent], 'inventory.json': {agent:{name:code,image:'fixed'}}, 'all.json': { 'agent-1': agent } })) {
      await fsp.writeFile(path.join(directory, filename), JSON.stringify(value));
    }
  }
  return { source, output };
}

test('generates only an exact selected batch while copying en and zh-CN byte for byte', async t => {
  const { source, output } = await generationFixture(t);
  const report = await generate({ source, output, languages: 'fr,ru' });
  assert.deepEqual(report.locales, ['en', 'zh-CN', 'ru', 'fr']);
  assert.deepEqual(report.generated, ['ru', 'fr']);
  assert.equal(report.templateAudit.locales, 28);
  assert.deepEqual((await fsp.readdir(path.join(output, 'api'))).sort(), ['en', 'fr', 'ru', 'zh-CN']);
  for (const code of ['en', 'zh-CN']) {
    assert.deepEqual(await fsp.readFile(path.join(output, 'api', code, 'all.json')), await fsp.readFile(path.join(source, 'public/api', code, 'all.json')));
  }
  const validation = await validateOutputs(path.join(output, 'api'), source, { locales: ['ru', 'fr'] });
  assert.equal(validation.locales, 4);
});

test('defaults to 27 locales without Thai and refuses invalid selected batches before writes', async t => {
  assert.equal(LOCALES.length, 27);
  assert.equal(LOCALES.includes('th'), false);
  const { source, output } = await generationFixture(t);
  await assert.rejects(generate({ source, output, languages: 'ru,unknown' }), /Unsupported language selection/);
  await assert.rejects(fsp.stat(output), { code: 'ENOENT' });
});
