import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditSources, EXPECTED_LOCALES, LOCALE_SOURCES, parseLocaleMappings } from "./audit-sources.mjs";

async function fixture(t) {
    const root = await mkdtemp(path.join(os.tmpdir(), "csgo-source-audit-test-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const source = path.join(root, "source");
    const tracker = path.join(root, "tracker");
    await mkdir(path.join(source, "utils"), { recursive: true });
    await mkdir(path.join(tracker, "static"), { recursive: true });
    const constants = `export const LANGUAGES_URL = [\n${Object.entries(LOCALE_SOURCES).map(([locale, name]) => `  { folder: '${locale}', url: getLanguageUrl('${name}') },`).join("\n")}\n];`;
    await writeFile(path.join(source, "constants.js"), constants);
    const templates = {};
    for (const [locale, name] of Object.entries(LOCALE_SOURCES)) {
        templates[locale] = {
            skin_souvenir: "Souvenir {item_name} | {pattern} ({wear})",
            highlight_charm: "Souvenir {charm_name} | {keychain_name} | {highlight_name}",
        };
        const tokens = locale === "en" ? {
            Hello: "Hello", Shared: "AK-47", only_en: "English only", Blank: "", number: 0,
            tournament: "Souvenir", Case: "first", case: "last", Control: "good", emoji: "😀",
        } : {
            hELLo: "Localized hello", Shared: "AK-47", Blank: "", number: 0,
            tournament: "Souvenir", Case: "last", Control: "good", emoji: "😀", Invisible: "\u200b",
        };
        await writeFile(path.join(tracker, "static", `csgo_${name}.json`), JSON.stringify({ lang: { Language: name === "koreana" ? "Korean" : name, Tokens: tokens } }));
    }
    await writeFile(path.join(source, "utils", "translations.json"), JSON.stringify(templates));
    return { root, source, tracker, constants };
}

async function editDictionary(tracker, locale, change) {
    const filename = path.join(tracker, "static", `csgo_${LOCALE_SOURCES[locale]}.json`);
    const data = JSON.parse(await readFile(filename, "utf8"));
    change(data);
    await writeFile(filename, JSON.stringify(data));
    return filename;
}

test("audits all 28 dictionaries, mirrors lowercase keys, hashes exact files, and separates numeric tokens", async t => {
    const { source, tracker } = await fixture(t);
    const report = await auditSources(source, tracker);
    assert.equal(report.summary.validDictionaries, 28);
    assert.equal(report.errors.length, 0);
    assert.equal(report.spelling.status, "not-certified");
    const english = report.locales.find(entry => entry.locale === "en");
    const french = report.locales.find(entry => entry.locale === "fr");
    assert.equal(english.coverage.lowercaseKeyCollisions, 1);
    assert.equal(french.coverage.missingEnglishTokens, 1);
    assert.deepEqual(french.coverage.missingEnglishTokenExamples, ["only_en"]);
    assert.equal(french.coverage.numericTokens, 1);
    assert.equal(french.coverage.emptyStringValues, 1);
    assert.equal(french.coverage.invisibleOnlyValues, 1);
    assert.ok(french.coverage.englishIdenticalExamples.includes("shared"));
    assert.match(french.coverage.englishIdenticalCaveat, /proper names/i);
    const raw = await readFile(path.join(tracker, french.file));
    assert.equal(french.sha256, createHash("sha256").update(raw).digest("hex"));
});

test("reports official replacement, surrogate, control, and format characters without changing or rejecting data", async t => {
    const { source, tracker } = await fixture(t);
    const filename = await editDictionary(tracker, "fr", data => { data.lang.Tokens.Control = "bad\u0001\ufffd\ud800\u200b"; });
    const before = await readFile(filename);
    const report = await auditSources(source, tracker);
    const french = report.locales.find(entry => entry.locale === "fr");
    assert.equal(report.errors.length, 0);
    assert.equal(french.integrity.forbiddenControlCharacters, 1);
    assert.equal(french.integrity.replacementCharacters, 1);
    assert.equal(french.integrity.unpairedSurrogates, 1);
    assert.equal(french.integrity.stringsWithIntegrityIssues, 1);
    assert.equal(french.integrity.formatCharacters, 2);
    assert.ok(french.warnings.includes("official-source-text-integrity"));
    assert.deepEqual(await readFile(filename), before);
});

test("treats invalid UTF-8 inside otherwise parseable JSON as a source warning", async t => {
    const { source, tracker } = await fixture(t);
    const filename = path.join(tracker, "static", "csgo_french.json");
    const raw = await readFile(filename);
    const offset = raw.indexOf(Buffer.from("Localized hello"));
    assert.ok(offset > 0);
    raw[offset] = 0xff;
    await writeFile(filename, raw);
    const report = await auditSources(source, tracker);
    const french = report.locales.find(entry => entry.locale === "fr");
    assert.equal(report.errors.length, 0);
    assert.equal(french.integrity.invalidUtf8, true);
    assert.equal(french.integrity.replacementCharacters, 1);
});

test("distinguishes terminology drift, Italian wrappers, and invisible-only Traditional Chinese source", async t => {
    const { source, tracker } = await fixture(t);
    await editDictionary(tracker, "fi", data => { data.lang.Tokens.tournament = "Tuliainen"; });
    await editDictionary(tracker, "it", data => { data.lang.Tokens.tournament = "(Souvenir)"; });
    await editDictionary(tracker, "zh-TW", data => { data.lang.Tokens.tournament = "\u200b"; });
    const report = await auditSources(source, tracker);
    assert.deepEqual(report.summary.localesWithSouvenirTerminologyDrift, ["fi"]);
    assert.deepEqual(report.summary.localesWithUnusableSouvenirSourceTerm, ["zh-TW"]);
    const italian = report.locales.find(entry => entry.locale === "it");
    assert.equal(italian.souvenir.comparisons[0].status, "wrapper-equivalent");
    assert.equal(italian.souvenir.comparisons[0].exactMatch, false);
    assert.equal(report.errors.length, 0);
});

test("continues scanning after invalid language or invalid JSON and returns a failing report", async t => {
    const { source, tracker } = await fixture(t);
    await editDictionary(tracker, "fr", data => { data.lang.Language = "german"; });
    await writeFile(path.join(tracker, "static", "csgo_russian.json"), "{");
    const report = await auditSources(source, tracker);
    assert.equal(report.status, "failed");
    assert.equal(report.locales.length, EXPECTED_LOCALES.length);
    assert.equal(report.summary.validDictionaries, 26);
    assert.equal(report.errors.length, 2);
    assert.ok(report.errors.some(error => /invalid dictionary language/.test(error.message)));
    assert.ok(report.errors.some(error => /invalid dictionary JSON/.test(error.message)));
});

test("fails on a missing English baseline or invalid token schema", async t => {
    const { source, tracker } = await fixture(t);
    await editDictionary(tracker, "fr", data => { data.lang.Tokens.Shared = {}; });
    const report = await auditSources(source, tracker);
    assert.equal(report.status, "failed");
    assert.match(report.errors[0].message, /invalid dictionary token value/);
    await rm(path.join(tracker, "static", "csgo_english.json"));
    await assert.rejects(auditSources(source, tracker), /missing or unreadable dictionary/);
});

test("rejects missing, duplicate, and incorrectly assigned expected mappings without executing source", async t => {
    const { constants } = await fixture(t);
    assert.equal(parseLocaleMappings(constants).size, 28);
    assert.throws(() => parseLocaleMappings(constants.replace("folder: 'fr'", "folder: 'other'")), /Cannot map expected locale fr/);
    assert.throws(() => parseLocaleMappings(constants.replace("getLanguageUrl('french')", "getLanguageUrl('german')")), /Cannot map expected locale fr/);
    assert.throws(() => parseLocaleMappings(constants.replace("\n];", "\n{ folder: 'fr', url: getLanguageUrl('french') },\n];")), /duplicate mapping/);
});

test("a missing custom template file warns instead of changing source dictionary validity", async t => {
    const { source, tracker } = await fixture(t);
    await rm(path.join(source, "utils", "translations.json"));
    const report = await auditSources(source, tracker);
    assert.equal(report.errors.length, 0);
    assert.match(report.templateError, /comparison unavailable/);
    assert.ok(report.locales.every(locale => locale.warnings.includes("missing-souvenir-template")));
});
