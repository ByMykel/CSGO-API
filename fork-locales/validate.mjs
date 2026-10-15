import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SUPPORTED_LOCALES = Object.freeze([
    "en", "zh-CN", "pt-BR", "ru", "es-ES", "bg", "cs", "da", "nl", "fi", "fr", "de", "el", "hu",
    "it", "ja", "ko", "es-MX", "no", "pl", "pt-PT", "ro", "sv", "zh-TW", "th", "tr", "uk", "vi",
]);

/** Existing fork output: Thai is opt-in because its all.json exceeds GitHub's limit. */
export const EXPECTED_LOCALES = Object.freeze(SUPPORTED_LOCALES.filter(locale => locale !== "th"));

/** Resolve a narrow output contract; en and zh-CN are always mirrored exactly. */
export function resolveLocales(selection) {
    if (selection === undefined) return [...EXPECTED_LOCALES];
    const requested = typeof selection === "string" ? selection.split(",").map(value => value.trim()) : selection;
    if (!Array.isArray(requested) || requested.length === 0 || requested.some(locale => typeof locale !== "string" || !locale)) {
        throw new Error("Language selection must be a nonempty comma-separated string or array of locale codes");
    }
    const unknown = requested.filter(locale => !SUPPORTED_LOCALES.includes(locale));
    if (unknown.length) throw new Error(`Unsupported language selection: ${unknown.join(", ")}`);
    if (new Set(requested).size !== requested.length) throw new Error("Duplicate language selection");
    const selected = new Set(["en", "zh-CN", ...requested]);
    return SUPPORTED_LOCALES.filter(locale => selected.has(locale));
}

const LOCALIZED_FIELDS = new Set([
    "name", "description", "breed", "color", "footer", "tournament_event", "team0", "team1", "stage",
]);
const CORRUPT_TEXT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFD]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const INVALID_UNICODE = /\uFFFD|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u;
const SOURCE_LANGUAGES = [
    "english", "schinese", "brazilian", "russian", "spanish", "bulgarian", "czech", "danish", "dutch", "finnish", "french", "german", "greek", "hungarian",
    "italian", "japanese", "koreana", "latam", "norwegian", "polish", "portuguese", "romanian", "swedish", "tchinese", "thai", "turkish", "ukrainian", "vietnamese",
];
const SPELLING_LIMITATION = "Official game strings and upstream templates are preserved. Text integrity and template checks do not establish correct spelling; native-language review is still needed to certify spelling in every language.";
const GITHUB_FILE_LIMIT = 100 * 1024 * 1024;

function fail(location, message) {
    throw new Error(`${location}: ${message}`);
}

function checkText(value, location, { issues = null, allowInherited = false, authoritative = false, sourceTokens = [] } = {}) {
    if (!CORRUPT_TEXT.test(value)) return;
    if (INVALID_UNICODE.test(value) && !authoritative) fail(location, "replacement character or invalid Unicode surrogate in text");
    let inherited = authoritative || allowInherited;
    if (!inherited && sourceTokens.length) {
        // Never edit the output. Remove complete, exact source tokens from a
        // temporary value solely to prove that every control marker is inherited.
        let unproven = value;
        for (const token of sourceTokens) {
            if (unproven.includes(token)) unproven = unproven.replaceAll(token, "");
            if (!CORRUPT_TEXT.test(unproven)) { inherited = true; break; }
        }
    }
    if (inherited && issues) {
        issues.strings += 1;
        if (issues.examples.length < 10) issues.examples.push(location);
        return;
    }
    fail(location, "replacement character, forbidden control character, or invalid Unicode surrogate in text");
}

function auditTextTree(value, location, inheritedIssues = null) {
    if (typeof value === "string") checkText(value, location, { issues: inheritedIssues, authoritative: Boolean(inheritedIssues) });
    else if (Array.isArray(value)) value.forEach((entry, index) => auditTextTree(entry, `${location}[${index}]`, inheritedIssues));
    else if (value && typeof value === "object") {
        for (const [key, entry] of Object.entries(value)) {
            checkText(key, `${location} (key)`, { issues: inheritedIssues, authoritative: Boolean(inheritedIssues) });
            auditTextTree(entry, `${location}.${key}`, inheritedIssues);
        }
    }
}

async function readJson(filename) {
    let contents;
    try {
        contents = await readFile(filename, "utf8");
    } catch (error) {
        fail(filename, `cannot read file (${error.code ?? error.message})`);
    }
    try {
        return JSON.parse(contents);
    } catch (error) {
        fail(filename, `invalid JSON (${error.message})`);
    }
}

async function jsonFiles(directory, { allowOversizedAll = false, oversized = [] } = {}) {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
        fail(directory, `cannot read locale directory (${error.code ?? error.message})`);
    }
    const files = [];
    for (const entry of entries) {
        if (entry.isSymbolicLink()) fail(path.join(directory, entry.name), "symbolic links are not valid generated output");
        if (entry.isDirectory()) fail(path.join(directory, entry.name), "unexpected nested output directory");
        if (entry.isFile() && entry.name.endsWith(".json")) {
            const filename = path.join(directory, entry.name);
            const bytes = (await stat(filename)).size;
            if (bytes >= GITHUB_FILE_LIMIT) {
                if (allowOversizedAll && entry.name === "all.json") oversized.push({ locale: path.basename(directory), file: entry.name, bytes, requiredAction: "Publish a verified gzip copy and remove the oversized raw file before committing" });
                else fail(filename, "file reaches GitHub's 100 MiB per-file limit; review publishing format before updating the fork");
            }
            files.push(entry.name);
        }
    }
    return files.sort();
}

function checkSet(actual, expected, location, what) {
    const actualSet = new Set(actual);
    const expectedSet = new Set(expected);
    const missing = expected.filter(value => !actualSet.has(value));
    const extra = actual.filter(value => !expectedSet.has(value));
    if (missing.length || extra.length) {
        fail(location, `${what} differ${missing.length ? `; missing: ${missing.slice(0, 10).join(", ")}` : ""}${extra.length ? `; unexpected: ${extra.slice(0, 10).join(", ")}` : ""}`);
    }
}

async function digest(filename) {
    const hash = createHash("sha256");
    try {
        for await (const chunk of createReadStream(filename)) hash.update(chunk);
    } catch (error) {
        fail(filename, `cannot hash file (${error.code ?? error.message})`);
    }
    return hash.digest("hex");
}

function isLocalized(key, ancestors) {
    if (ancestors.includes("original")) return false;
    if (key === "color" && ancestors.at(-1) === "rarity") return false;
    return LOCALIZED_FIELDS.has(key);
}

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function itemIdKey(value) {
    return `${typeof value}:${value}`;
}

// Translation can change a string (including its nullability), but must not change
// inventory identifiers, English market names, URLs, numbers, flags, or metadata.
function compareTree(actual, expected, location, ancestors = [], key = "", inheritedIssues = null, sourceTokens = []) {
    if (typeof actual === "string") checkText(actual, location, { issues: inheritedIssues, allowInherited: actual === expected, sourceTokens });
    if (isLocalized(key, ancestors)) {
        if ((actual !== null && !["string", "number"].includes(typeof actual)) ||
            (expected !== null && !["string", "number"].includes(typeof expected))) {
            fail(location, "localized field must contain text, a numeric game token, or null");
        }
        if (key === "name" && expected !== null && String(expected).trim() &&
            (actual === null || !String(actual).trim())) {
            fail(location, "missing or empty localized name");
        }
        return;
    }

    if (Array.isArray(expected)) {
        if (!Array.isArray(actual)) fail(location, "expected an array");
        if (actual.length !== expected.length) fail(location, `item count differs: ${actual.length}, expected ${expected.length}`);
        const haveIds = expected.length > 0 && expected.every(entry => isRecord(entry) && ["string", "number"].includes(typeof entry.id));
        if (haveIds) {
            const expectedIds = expected.map(entry => itemIdKey(entry.id));
            // Some upstream arrays intentionally repeat the same ID. Keep their
            // order in that case, so validation does not collapse those entries.
            if (new Set(expectedIds).size === expected.length) {
                const indexed = new Map();
                for (const entry of actual) {
                    if (!isRecord(entry) || !["string", "number"].includes(typeof entry.id)) fail(location, "array entry has no valid id");
                    const id = itemIdKey(entry.id);
                    if (indexed.has(id)) fail(location, `duplicate item id ${entry.id}`);
                    indexed.set(id, entry);
                }
                checkSet([...indexed.keys()], expectedIds, location, "item IDs");
                expected.forEach(entry => compareTree(indexed.get(itemIdKey(entry.id)), entry, `${location}[id=${entry.id}]`, ancestors, "", inheritedIssues, sourceTokens));
                return;
            }
        }
        expected.forEach((entry, index) => compareTree(actual[index], entry, `${location}[${index}]`, ancestors, "", inheritedIssues, sourceTokens));
        return;
    }

    if (isRecord(expected)) {
        if (!isRecord(actual)) fail(location, "expected an object");
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        for (const field of actualKeys) checkText(field, `${location} (key)`, { issues: inheritedIssues, allowInherited: Object.hasOwn(expected, field), sourceTokens });
        const nextAncestors = key ? [...ancestors, key] : ancestors;
        checkSet(actualKeys.filter(field => !isLocalized(field, nextAncestors)),
            expectedKeys.filter(field => !isLocalized(field, nextAncestors)), location, "object keys");
        for (const field of new Set([...expectedKeys, ...actualKeys])) {
            if (!(field in actual) || !(field in expected)) {
                const present = field in actual ? actual[field] : expected[field];
                if (!isLocalized(field, nextAncestors) || (present !== null && typeof present !== "string" && typeof present !== "number")) {
                    fail(`${location}.${field}`, "missing or unexpected field");
                }
                if (field === "name" && field in expected && expected[field] !== null) fail(`${location}.${field}`, "missing localized name");
                if (field in actual && typeof actual[field] === "string") checkText(actual[field], `${location}.${field}`, { issues: inheritedIssues, sourceTokens });
                continue;
            }
            compareTree(actual[field], expected[field], `${location}.${field}`, nextAncestors, field, inheritedIssues, sourceTokens);
        }
        return;
    }

    if (actual !== expected) fail(location, `stable value differs (expected ${JSON.stringify(expected)?.slice(0, 160)})`);
}

function countItems(value) {
    if (Array.isArray(value)) return value.length;
    if (isRecord(value)) return Object.keys(value).length;
    return 0;
}

async function loadControlEvidence(fileTracker, locales) {
    if (!fileTracker) return {};
    const evidence = {};
    for (const locale of locales) {
        const index = SUPPORTED_LOCALES.indexOf(locale);
        const filename = path.join(fileTracker, "static", `csgo_${SOURCE_LANGUAGES[index]}.json`);
        const document = await readJson(filename);
        if (!isRecord(document?.lang?.Tokens)) fail(filename, "missing source translation tokens");
        evidence[locale] = [...new Set(Object.values(document.lang.Tokens).filter(value => typeof value === "string" && CORRUPT_TEXT.test(value) && !INVALID_UNICODE.test(value)))];
    }
    for (const locale of locales) evidence[locale] = [...new Set([...evidence[locale], ...evidence.en])].sort((a, b) => b.length - a.length);
    return evidence;
}

/** outputDir contains locale folders; referenceDir is the upstream checkout root. */
export async function validateOutputs(outputDir, referenceDir, { fileTracker, oversizedAll = "reject", onProgress, locales: selectedLocales } = {}) {
    const locales = resolveLocales(selectedLocales);
    if (!["reject", "gzip"].includes(oversizedAll)) fail(outputDir, `unsupported oversizedAll policy ${oversizedAll}`);
    const rootEntries = await readdir(outputDir, { withFileTypes: true });
    const directories = rootEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);
    checkSet(directories, locales, outputDir, "locale directories");
    for (const entry of rootEntries) if (entry.isSymbolicLink()) fail(path.join(outputDir, entry.name), "symbolic links are not valid generated output");

    const referenceApi = path.join(referenceDir, "public", "api");
    const controlEvidence = await loadControlEvidence(fileTracker, locales);
    const files = await jsonFiles(path.join(referenceApi, "en"));
    if (!files.length) fail(referenceApi, "reference has no English JSON endpoints");
    const oversizedAllFiles = [];
    for (const locale of locales) checkSet(await jsonFiles(path.join(outputDir, locale), {
        allowOversizedAll: oversizedAll === "gzip" && !["en", "zh-CN"].includes(locale), oversized: oversizedAllFiles,
    }), files, path.join(outputDir, locale), "endpoint files");
    onProgress?.("Checking en and zh-CN against the upstream bytes");
    for (const locale of ["en", "zh-CN"]) {
        checkSet(await jsonFiles(path.join(referenceApi, locale)), files, path.join(referenceApi, locale), "reference endpoint files");
        for (const file of files) {
            const actual = path.join(outputDir, locale, file);
            const expected = path.join(referenceApi, locale, file);
            if (await digest(actual) !== await digest(expected)) fail(actual, `must match upstream ${locale} byte for byte`);
        }
    }

    const endpoints = {};
    const inheritedIssues = Object.fromEntries(locales.map(locale => [locale, { locale, strings: 0, examples: [] }]));
    // One endpoint at a time bounds memory when all.json grows large.
    for (const file of files) {
        onProgress?.(`Validating ${file} in all ${locales.length} locales`);
        const english = await readJson(path.join(outputDir, "en", file));
        if (!Array.isArray(english) && !isRecord(english)) fail(file, "endpoint must contain an array or object");
        endpoints[file] = countItems(english);
        auditTextTree(english, `en/${file}`, inheritedIssues.en);
        for (const locale of locales.filter(code => code !== "en")) {
            const actual = await readJson(path.join(outputDir, locale, file));
            // Simplified Chinese has official regional differences in thumbnails,
            // videos, and some market names. Its exact upstream copy is checked above.
            if (locale === "zh-CN") auditTextTree(actual, `${locale}/${file}`, inheritedIssues[locale]);
            else compareTree(actual, english, `${locale}/${file}`, [], "", inheritedIssues[locale], controlEvidence[locale]);
        }
    }

    return {
        locales: locales.length,
        localeCodes: locales,
        files: files.length * locales.length,
        endpoints,
        checks: ["en and zh-CN match upstream bytes", "all requested locales and endpoints present", "JSON/schema and item identity parity", "stable metadata parity", "Unicode text integrity; inherited upstream issues reported"],
        upstreamTextWarnings: Object.values(inheritedIssues).filter(issue => issue.strings > 0).map(issue => ({
            ...issue,
            detail: "These strings occur in the authoritative upstream locale, equal the corresponding English value, or contain complete exact tokens from the pinned official dictionaries. Their inherited markers were preserved; this report does not certify spelling or text quality.",
        })),
        sourceControlEvidence: fileTracker ? "Exact token substrings from the supplied official locale and English dictionaries" : "Only exact corresponding English values and copied authoritative locales",
        oversizedAllFiles,
        spelling: { status: "not-certified", detail: SPELLING_LIMITATION },
    };
}

function placeholders(template, location) {
    const matches = template.match(/\{[^{}]+\}/g) ?? [];
    if (/[{}]/.test(template.replace(/\{[^{}]+\}/g, ""))) fail(location, "malformed template braces");
    return matches.sort();
}

/** Check all templates, including repeated placeholders and language coverage. */
export async function auditTemplates(sourceDir) {
    const filename = path.join(sourceDir, "utils", "translations.json");
    const templates = await readJson(filename);
    if (!isRecord(templates) || !isRecord(templates.en) || !Object.keys(templates.en).length) fail(filename, "missing English template baseline");
    const keys = Object.keys(templates.en);
    for (const locale of SUPPORTED_LOCALES) {
        const values = templates[locale];
        if (!isRecord(values)) fail(`${filename}:${locale}`, "missing locale templates");
        checkSet(Object.keys(values), keys, `${filename}:${locale}`, "template keys");
        for (const key of keys) {
            const value = values[key];
            const location = `${filename}:${locale}.${key}`;
            if (typeof value !== "string" || !value.trim()) fail(location, "template must be nonempty text");
            checkText(value, location);
            const actual = placeholders(value, location);
            const expected = placeholders(templates.en[key], `${filename}:en.${key}`);
            if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(location, "template placeholder names or counts differ from English");
        }
    }
    return {
        locales: SUPPORTED_LOCALES.length,
        templates: SUPPORTED_LOCALES.length * keys.length,
        checks: ["template coverage", "placeholder names and counts", "Unicode text integrity"],
        spelling: { status: "not-certified", detail: SPELLING_LIMITATION },
    };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    let reportPath;
    try {
        const args = process.argv.slice(2);
        let outputDir;
        let referenceDir;
        let fileTracker;
        let locales;
        let oversizedAll = "reject";
        if (args.some(arg => arg.startsWith("--"))) {
            for (let index = 0; index < args.length; index += 2) {
                const option = args[index];
                const value = args[index + 1];
                if (!value || value.startsWith("--")) throw new Error(`Missing value for ${option}`);
                if (option === "--output") outputDir = value;
                else if (option === "--reference") referenceDir = value;
                else if (option === "--report") reportPath = path.resolve(value);
                else if (option === "--file-tracker") fileTracker = path.resolve(value);
                else if (option === "--oversized-all") oversizedAll = value;
                else if (option === "--languages") locales = value;
                else throw new Error(`Unknown option ${option}`);
            }
        } else [outputDir, referenceDir] = args;
        if (!outputDir || !referenceDir) throw new Error("Usage: node fork-locales/validate.mjs --output <staging-directory-or-api-root> --reference <upstream-checkout> [--report <report.json>] [--file-tracker <official-dictionary-checkout>] [--oversized-all reject|gzip] [--languages pt-BR,ru,...]");
        outputDir = path.resolve(outputDir);
        // Both the generator's staging directory and its api child are supported.
        try {
            if ((await stat(path.join(outputDir, "api"))).isDirectory()) outputDir = path.join(outputDir, "api");
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }
        const report = { status: "passed", ...await validateOutputs(outputDir, path.resolve(referenceDir), {
            fileTracker, oversizedAll, locales, onProgress: message => console.error(`[validate] ${message}`),
        }) };
        if (reportPath) {
            await mkdir(path.dirname(reportPath), { recursive: true });
            await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
        }
        console.log(JSON.stringify(report, null, 2));
    } catch (error) {
        if (reportPath) {
            try {
                await mkdir(path.dirname(reportPath), { recursive: true });
                await writeFile(reportPath, `${JSON.stringify({ status: "failed", error: error.message, spelling: { status: "not-certified", detail: SPELLING_LIMITATION } }, null, 2)}\n`);
            } catch (reportError) {
                console.error(`Could not write validation report: ${reportError.message}`);
            }
        }
        console.error(`Validation failed: ${error.message}`);
        process.exitCode = 1;
    }
}
