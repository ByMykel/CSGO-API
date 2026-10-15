import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Fixed expected mappings prevent an upstream configuration mistake from silently
// assigning another language's dictionary to one of the requested API folders.
export const LOCALE_SOURCES = Object.freeze({
    en: "english", "zh-CN": "schinese", "pt-BR": "brazilian", ru: "russian",
    "es-ES": "spanish", bg: "bulgarian", cs: "czech", da: "danish", nl: "dutch",
    fi: "finnish", fr: "french", de: "german", el: "greek", hu: "hungarian",
    it: "italian", ja: "japanese", ko: "koreana", "es-MX": "latam", no: "norwegian",
    pl: "polish", "pt-PT": "portuguese", ro: "romanian", sv: "swedish",
    "zh-TW": "tchinese", th: "thai", tr: "turkish", uk: "ukrainian", vi: "vietnamese",
});
export const EXPECTED_LOCALES = Object.freeze(Object.keys(LOCALE_SOURCES));
const EXAMPLE_LIMIT = 12;
const SPELLING_CAVEAT = "Not spelling-certified. This scans source integrity, token coverage, and selected template terminology; it does not linguistically proofread the official dictionaries or certify future changes.";
const IDENTICAL_CAVEAT = "Text identical to English can be correct: proper names, brands, weapon names, numbers, borrowed terms, and intentionally shared text are included. This count is not a translation error count.";
const EMPTY_CAVEAT = "Empty strings can be intentional. Missing or falsy translated tokens may fall back to English in upstream code. Whitespace/invisible-only strings are reported separately because they can remain truthy.";

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hash(contents) {
    return createHash("sha256").update(contents).digest("hex");
}

function hasVisibleContent(value) {
    return typeof value === "string" && value.replace(/[\p{White_Space}\p{Cf}]/gu, "").length > 0;
}

function sample(values) {
    return values.slice(0, EXAMPLE_LIMIT);
}

function dictionaryHeaderMatches(sourceName, header) {
    if (typeof header !== "string") return false;
    const normalized = header.trim().toLowerCase();
    return normalized === sourceName || (sourceName === "koreana" && normalized === "korean");
}

// Mirror the upstream loader's key.toLowerCase() behavior, including last-value
// wins. Do not trim or NFC-normalize keys and accidentally invent coverage.
function normalizeTokens(tokens) {
    const normalized = new Map();
    const collisions = [];
    for (const [key, value] of Object.entries(tokens)) {
        const normalizedKey = key.toLowerCase();
        if (normalized.has(normalizedKey)) collisions.push(normalizedKey);
        normalized.set(normalizedKey, value);
    }
    return { normalized, collisions };
}

export function parseLocaleMappings(constantsText) {
    const declaration = constantsText.match(/\bexport\s+const\s+LANGUAGES_URL\s*=\s*\[([\s\S]*?)\]\s*;/);
    if (!declaration) throw new Error("Cannot map expected locales: constants.js has no recognizable LANGUAGES_URL array; review the upstream configuration format");
    const mappings = new Map();
    for (const match of declaration[1].matchAll(/\{([\s\S]*?)\}/g)) {
        const folder = match[1].match(/\bfolder\s*:\s*(["'])(.*?)\1/);
        const source = match[1].match(/\burl\s*:\s*getLanguageUrl\(\s*(["'])(.*?)\1\s*\)/);
        if (!folder || !Object.hasOwn(LOCALE_SOURCES, folder[2])) continue;
        if (!source || source[2] !== LOCALE_SOURCES[folder[2]]) {
            throw new Error(`Cannot map expected locale ${folder[2]} to its ${LOCALE_SOURCES[folder[2]]} dictionary; review constants.js`);
        }
        if (mappings.has(folder[2])) throw new Error(`Cannot map expected locale ${folder[2]} unambiguously: duplicate mapping`);
        mappings.set(folder[2], source[2]);
    }
    for (const locale of EXPECTED_LOCALES) {
        if (!mappings.has(locale)) throw new Error(`Cannot map expected locale ${locale}: missing recognizable mapping in constants.js`);
    }
    return mappings;
}

function textIssueCounts(tokens) {
    const result = {
        replacementCharacters: 0, unpairedSurrogates: 0, forbiddenControlCharacters: 0,
        permittedWhitespaceControlCharacters: 0, formatCharacters: 0,
        stringsWithIntegrityIssues: 0, stringsNotNfc: 0, examples: [],
        note: "Counts cover token keys and string values. U+FFFD, unpaired surrogates, and C0/C1 controls other than TAB/LF/CR are warnings. Official chat color/format codes can legitimately use these control characters; the count is not proof of corruption. Format characters and non-NFC text can also be legitimate. No official string is rewritten.",
    };
    function inspect(value, tokenKey, field) {
        let affected = false;
        const points = new Set();
        for (const char of value) {
            const point = char.codePointAt(0);
            if (point === 0xfffd) {
                result.replacementCharacters += 1;
                affected = true;
                points.add("U+FFFD");
            } else if (point >= 0xd800 && point <= 0xdfff) {
                result.unpairedSurrogates += 1;
                affected = true;
                points.add(`U+${point.toString(16).toUpperCase()}`);
            } else if ((point <= 0x1f && ![9, 10, 13].includes(point)) || (point >= 0x7f && point <= 0x9f)) {
                result.forbiddenControlCharacters += 1;
                affected = true;
                points.add(`U+${point.toString(16).toUpperCase().padStart(4, "0")}`);
            } else if ([9, 10, 13].includes(point)) result.permittedWhitespaceControlCharacters += 1;
            if (/\p{Cf}/u.test(char)) result.formatCharacters += 1;
        }
        if (value.normalize("NFC") !== value) result.stringsNotNfc += 1;
        if (affected) {
            result.stringsWithIntegrityIssues += 1;
            if (result.examples.length < EXAMPLE_LIMIT) result.examples.push({ tokenKey, field, codePoints: [...points] });
        }
    }
    for (const [key, value] of Object.entries(tokens)) {
        inspect(key, key, "key");
        if (typeof value === "string") inspect(value, key, "value");
    }
    return result;
}

async function loadDictionary(filename, sourceName) {
    let raw;
    try {
        raw = await readFile(filename);
    } catch (error) {
        throw new Error(`${filename}: missing or unreadable dictionary (${error.code ?? error.message})`);
    }
    let invalidUtf8 = false;
    try {
        new TextDecoder("utf-8", { fatal: true }).decode(raw);
    } catch {
        invalidUtf8 = true;
    }
    let data;
    try {
        data = JSON.parse(raw.toString("utf8"));
    } catch (error) {
        throw new Error(`${filename}: invalid dictionary JSON (${error.message})`);
    }
    if (!isRecord(data) || !isRecord(data.lang) || !dictionaryHeaderMatches(sourceName, data.lang.Language)) {
        throw new Error(`${filename}: invalid dictionary language; expected ${sourceName}${sourceName === "koreana" ? " (or Korean header)" : ""}`);
    }
    if (!isRecord(data.lang.Tokens) || !Object.keys(data.lang.Tokens).length) {
        throw new Error(`${filename}: invalid dictionary schema; lang.Tokens must be a nonempty object`);
    }
    for (const [key, value] of Object.entries(data.lang.Tokens)) {
        // The real Valve JSON includes numeric tokens. They are valid source
        // data, not broken translations, and are excluded from text comparisons.
        if (typeof value !== "string" && !(typeof value === "number" && Number.isFinite(value))) {
            throw new Error(`${filename}: invalid dictionary token value for ${JSON.stringify(key)}; expected string or finite number`);
        }
    }
    return { tokens: data.lang.Tokens, languageHeader: data.lang.Language, sha256: hash(raw), bytes: raw.length, invalidUtf8, ...normalizeTokens(data.lang.Tokens) };
}

function coverage(dictionary, english) {
    const missing = [];
    const empty = [];
    const emptyWhileEnglishNonempty = [];
    const identical = [];
    let comparableTextTokens = 0;
    let emptyStringValues = 0;
    let whitespaceOnlyValues = 0;
    let invisibleOnlyValues = 0;
    let numericTokens = 0;
    for (const [key, value] of dictionary.normalized) {
        if (typeof value === "number") {
            numericTokens += 1;
            continue;
        }
        if (!hasVisibleContent(value)) {
            empty.push(key);
            if (value.length === 0) emptyStringValues += 1;
            else if (value.trim().length === 0) whitespaceOnlyValues += 1;
            else invisibleOnlyValues += 1;
        }
    }
    for (const [key, englishValue] of english.normalized) {
        if (!dictionary.normalized.has(key)) {
            missing.push(key);
            continue;
        }
        const value = dictionary.normalized.get(key);
        if (hasVisibleContent(englishValue) && typeof value === "string" && !hasVisibleContent(value)) emptyWhileEnglishNonempty.push(key);
        if (hasVisibleContent(englishValue) && hasVisibleContent(value)) {
            comparableTextTokens += 1;
            if (value === englishValue) identical.push(key);
        }
    }
    return {
        keyNormalization: "JavaScript key.toLowerCase(), matching the upstream loader; last value wins for collisions",
        rawTokens: Object.keys(dictionary.tokens).length,
        normalizedTokens: dictionary.normalized.size,
        numericTokens,
        lowercaseKeyCollisions: dictionary.collisions.length,
        lowercaseKeyCollisionExamples: sample(dictionary.collisions),
        missingEnglishTokens: missing.length,
        missingEnglishTokenExamples: sample(missing),
        extraTokensBeyondEnglish: [...dictionary.normalized.keys()].filter(key => !english.normalized.has(key)).length,
        emptyOrInvisibleTokens: empty.length,
        emptyStringValues, whitespaceOnlyValues, invisibleOnlyValues,
        emptyOrInvisibleTokenExamples: sample(empty),
        emptyWhileEnglishNonemptyTokens: emptyWhileEnglishNonempty.length,
        emptyWhileEnglishNonemptyExamples: sample(emptyWhileEnglishNonempty),
        emptyValueCaveat: EMPTY_CAVEAT,
        englishComparableTextTokens: comparableTextTokens,
        englishIdenticalTextTokens: identical.length,
        englishIdenticalPercent: comparableTextTokens ? Number((100 * identical.length / comparableTextTokens).toFixed(2)) : null,
        englishIdenticalExamples: sample(identical),
        englishIdenticalCaveat: IDENTICAL_CAVEAT,
    };
}

function souvenirAudit(templates, locale, dictionary) {
    const rawTerm = dictionary.normalized.get("tournament");
    const usable = hasVisibleContent(rawTerm);
    const stripWrappers = text => text.replace(/[()（）]/gu, "").trim();
    const comparisons = [];
    for (const key of ["skin_souvenir", "highlight_charm"]) {
        const template = templates?.[locale]?.[key];
        if (typeof template !== "string") {
            comparisons.push({ key, status: "missing-template", templateLiteral: null });
            continue;
        }
        const literal = template.replace(/\{[^{}]*\}/g, "").replace(/[|()（）]/gu, "").trim();
        comparisons.push({
            key, templateLiteral: literal,
            exactMatch: usable && literal === rawTerm,
            status: !usable ? "unusable-source-term" : literal === rawTerm ? "exact-match" : literal === stripWrappers(rawTerm) ? "wrapper-equivalent" : "terminology-drift",
        });
    }
    return {
        sourceToken: "tournament", sourceTermRaw: rawTerm ?? null, sourceTermUsable: usable,
        sourceTermCodePoints: typeof rawTerm === "string" ? [...rawTerm].map(char => `U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`) : [],
        comparisons,
        note: "No correction is made. The separate token named Souvenir often labels a map shop and is not a safe replacement. Drift is not proof of a spelling error; wrapper-equivalent values need punctuation handling.",
    };
}

/** Read-only audit. fileTrackerRoot is the extracted snapshot root containing static/. */
export async function auditSources(sourceRoot, fileTrackerRoot) {
    const constantsFilename = path.join(sourceRoot, "constants.js");
    let constantsRaw;
    try {
        constantsRaw = await readFile(constantsFilename);
    } catch (error) {
        throw new Error(`Cannot map expected locales: ${constantsFilename} cannot be read (${error.code ?? error.message})`);
    }
    const mappings = parseLocaleMappings(constantsRaw.toString("utf8"));
    let templates;
    let templateError = null;
    let templateSha256 = null;
    try {
        const raw = await readFile(path.join(sourceRoot, "utils", "translations.json"));
        templateSha256 = hash(raw);
        templates = JSON.parse(raw.toString("utf8"));
    } catch (error) {
        templateError = `Custom template comparison unavailable: ${error.message}`;
    }
    const english = await loadDictionary(path.join(fileTrackerRoot, "static", "csgo_english.json"), "english");
    const report = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        status: "passed-with-warnings",
        source: { root: path.resolve(sourceRoot), constantsSha256: hash(constantsRaw), templateSha256 },
        fileTrackerRoot: path.resolve(fileTrackerRoot),
        expectedLocaleCount: EXPECTED_LOCALES.length,
        spelling: { status: "not-certified", note: SPELLING_CAVEAT },
        policy: "Source content is preserved. Missing/empty tokens, identical English values, terminology drift, Unicode issues, and legitimate numeric tokens do not fail this audit. Missing/invalid dictionaries or unmappable/wrong-language sources fail.",
        templateError,
        summary: {}, locales: [], errors: [],
    };
    for (const locale of EXPECTED_LOCALES) {
        const sourceName = mappings.get(locale);
        const relativeFile = path.posix.join("static", `csgo_${sourceName}.json`);
        try {
            const dictionary = locale === "en" ? english : await loadDictionary(path.join(fileTrackerRoot, relativeFile), sourceName);
            const integrity = { invalidUtf8: dictionary.invalidUtf8, ...textIssueCounts(dictionary.tokens) };
            const tokenCoverage = coverage(dictionary, english);
            const souvenir = souvenirAudit(templates, locale, dictionary);
            const warnings = [];
            if (integrity.invalidUtf8 || integrity.stringsWithIntegrityIssues) warnings.push("official-source-text-integrity");
            if (integrity.formatCharacters) warnings.push("format-characters-present-review-context");
            if (tokenCoverage.lowercaseKeyCollisions) warnings.push("lowercase-key-collisions");
            if (locale !== "en" && tokenCoverage.missingEnglishTokens) warnings.push("missing-english-token-keys");
            if (locale !== "en" && tokenCoverage.emptyWhileEnglishNonemptyTokens) warnings.push("empty-target-for-nonempty-english");
            if (souvenir.comparisons.some(comparison => comparison.status === "terminology-drift")) warnings.push("souvenir-terminology-drift");
            if (souvenir.comparisons.some(comparison => comparison.status === "unusable-source-term")) warnings.push("unusable-souvenir-source-term");
            if (souvenir.comparisons.some(comparison => comparison.status === "missing-template")) warnings.push("missing-souvenir-template");
            report.locales.push({ locale, sourceName, file: relativeFile, status: "valid-dictionary", languageHeader: dictionary.languageHeader, sha256: dictionary.sha256, bytes: dictionary.bytes, coverage: tokenCoverage, integrity, souvenir, warnings });
        } catch (error) {
            const message = error.message;
            report.errors.push({ locale, message });
            report.locales.push({ locale, sourceName, file: relativeFile, status: "invalid-dictionary", error: message });
        }
    }
    const valid = report.locales.filter(locale => locale.status === "valid-dictionary");
    report.summary = {
        validDictionaries: valid.length,
        invalidDictionaries: report.errors.length,
        totalRawTokensScanned: valid.reduce((sum, locale) => sum + locale.coverage.rawTokens, 0),
        localesWithIntegrityWarnings: valid.filter(locale => locale.integrity.invalidUtf8 || locale.integrity.stringsWithIntegrityIssues).map(locale => locale.locale),
        localesWithSouvenirTerminologyDrift: valid.filter(locale => locale.souvenir.comparisons.some(comparison => comparison.status === "terminology-drift")).map(locale => locale.locale),
        localesWithUnusableSouvenirSourceTerm: valid.filter(locale => !locale.souvenir.sourceTermUsable).map(locale => locale.locale),
        localeSummariesContainExamplesOnly: true,
        exampleLimit: EXAMPLE_LIMIT,
    };
    report.status = report.errors.length ? "failed" : "passed-with-warnings";
    return report;
}

export function printSummary(report) {
    console.log(`Official source audit: ${report.status}; ${report.summary.validDictionaries ?? 0}/${report.expectedLocaleCount ?? EXPECTED_LOCALES.length} valid dictionaries`);
    console.log("locale tokens missing empty nonemptyEN-empty identicalEN integrityStrings souvenir");
    for (const locale of report.locales ?? []) {
        if (locale.status !== "valid-dictionary") {
            console.log(`${locale.locale}: INVALID (${JSON.stringify(locale.error)})`);
            continue;
        }
        const c = locale.coverage;
        const terms = [...new Set(locale.souvenir.comparisons.map(comparison => comparison.status))].join(",");
        console.log(`${locale.locale} ${c.rawTokens} ${c.missingEnglishTokens} ${c.emptyOrInvisibleTokens} ${c.emptyWhileEnglishNonemptyTokens} ${c.englishIdenticalTextTokens}/${c.englishComparableTextTokens} ${locale.integrity.stringsWithIntegrityIssues} ${terms}`);
    }
    console.log(IDENTICAL_CAVEAT);
    console.log(SPELLING_CAVEAT);
}

async function main(args) {
    const options = new Map();
    if (args.includes("--help")) {
        console.log("Usage: node audit-sources.mjs --source <upstream-root> --file-tracker <snapshot-root-containing-static> --report <json-file>");
        return;
    }
    for (let index = 0; index < args.length; index += 2) {
        const key = args[index];
        const value = args[index + 1];
        if (!["--source", "--file-tracker", "--report"].includes(key) || !value || value.startsWith("--") || options.has(key)) throw new Error("Expected unique --source, --file-tracker, and --report arguments; use --help");
        options.set(key, value);
    }
    if (options.size !== 3) throw new Error("Required: --source <upstream-root> --file-tracker <snapshot-root> --report <json-file>");
    let report;
    try {
        report = await auditSources(options.get("--source"), options.get("--file-tracker"));
    } catch (error) {
        report = { schemaVersion: 1, generatedAt: new Date().toISOString(), status: "failed", expectedLocaleCount: EXPECTED_LOCALES.length, spelling: { status: "not-certified", note: SPELLING_CAVEAT }, summary: {}, locales: [], errors: [{ message: error.message }] };
    }
    const filename = path.resolve(options.get("--report"));
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, `${JSON.stringify(report, null, 2)}\n`);
    printSummary(report);
    if (report.errors.length) {
        for (const error of report.errors) console.error(error.message);
        process.exitCode = 1;
    }
    console.log(`Audit JSON: ${filename}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main(process.argv.slice(2)).catch(error => {
        console.error(`Source audit failed: ${error.message}`);
        process.exitCode = 1;
    });
}
