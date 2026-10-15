import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, truncate, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { auditTemplates, EXPECTED_LOCALES, SUPPORTED_LOCALES, resolveLocales, validateOutputs } from "./validate.mjs";

const item = {
    id: "skin-1", name: "Example", description: "An official description", min_float: 0.1, stattrak: true,
    market_hash_name: "Example (Factory New)", image: "https://example.test/image.png",
    rarity: { id: "rare", name: "Rare", color: "#ffffff" },
    original: { name: "weapon_example" }, color: "Tan", collections: [{ id: "collection-1", name: "Example Collection" }],
};

async function fixture(t, locales = EXPECTED_LOCALES) {
    const root = await mkdtemp(path.join(os.tmpdir(), "csgo-validator-test-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    const output = path.join(root, "output");
    const reference = path.join(root, "reference");
    for (const locale of locales) {
        const folder = path.join(output, locale);
        await mkdir(folder, { recursive: true });
        const localized = structuredClone(item);
        if (!["en", "zh-CN"].includes(locale)) {
            localized.name = "Localized official name";
            localized.description = null;
            localized.rarity.name = "Localized rarity";
        }
        await writeFile(path.join(folder, "skins.json"), JSON.stringify([localized]));
        await writeFile(path.join(folder, "inventory.json"), JSON.stringify({ skins: { "7": { "1": { name: localized.name, rarity: localized.rarity, marketable: true, image: item.image } } } }));
        if (["en", "zh-CN"].includes(locale)) {
            const target = path.join(reference, "public", "api", locale);
            await mkdir(target, { recursive: true });
            for (const file of ["skins.json", "inventory.json"]) await writeFile(path.join(target, file), await readFile(path.join(folder, file)));
        }
    }
    return { root, output, reference };
}

async function editJson(output, locale, file, change) {
    const target = path.join(output, locale, file);
    const value = JSON.parse(await readFile(target, "utf8"));
    change(value);
    await writeFile(target, JSON.stringify(value));
}

test("validates the 27 existing fork locales and preserves legitimate localized nullability", async t => {
    const { output, reference } = await fixture(t);
    await editJson(output, "fr", "skins.json", data => { delete data[0].description; });
    await editJson(output, "fr", "skins.json", data => { data[0].color = "Brun"; });
    const report = await validateOutputs(output, reference);
    assert.equal(report.locales, 27);
    assert.equal(report.files, 54);
    assert.equal(report.spelling.status, "not-certified");
});

test("rejects a changed upstream English copy even if JSON is equivalent", async t => {
    const { output, reference } = await fixture(t);
    await writeFile(path.join(output, "en", "skins.json"), `${JSON.stringify([item])}\n`);
    await assert.rejects(validateOutputs(output, reference), /en.*byte for byte/);
});

test("rejects a changed upstream Simplified Chinese copy", async t => {
    const { output, reference } = await fixture(t);
    await editJson(output, "zh-CN", "skins.json", data => { data[0].image += "?changed"; });
    await assert.rejects(validateOutputs(output, reference), /zh-CN.*byte for byte/);
});

test("preserves and reports text markers already present in authoritative locales", async t => {
    const { output, reference } = await fixture(t);
    for (const locale of ["en", "zh-CN"]) {
        await editJson(output, locale, "skins.json", data => { data[0].name = "Official\u0008marker"; });
        await writeFile(path.join(reference, "public", "api", locale, "skins.json"), await readFile(path.join(output, locale, "skins.json")));
    }
    const report = await validateOutputs(output, reference);
    assert.deepEqual(report.upstreamTextWarnings.map(issue => [issue.locale, issue.strings]), [["en", 1], ["zh-CN", 1]]);
});

test("reports inherited English control markers in stable metadata", async t => {
    const { output, reference } = await fixture(t);
    for (const locale of EXPECTED_LOCALES) {
        await editJson(output, locale, "skins.json", data => { data[0].market_hash_name = "Official\u0092market name"; });
        if (["en", "zh-CN"].includes(locale)) await writeFile(path.join(reference, "public", "api", locale, "skins.json"), await readFile(path.join(output, locale, "skins.json")));
    }
    assert.equal((await validateOutputs(output, reference)).upstreamTextWarnings.length, 27);
});

test("allows source-proven localized control markers, while rejecting unproven text and invalid Unicode", async t => {
    const { root, output, reference } = await fixture(t);
    const fileTracker = path.join(root, "file-tracker");
    await mkdir(path.join(fileTracker, "static"), { recursive: true });
    const languageNames = ["english", "schinese", "brazilian", "russian", "spanish", "bulgarian", "czech", "danish", "dutch", "finnish", "french", "german", "greek", "hungarian", "italian", "japanese", "koreana", "latam", "norwegian", "polish", "portuguese", "romanian", "swedish", "tchinese", "thai", "turkish", "ukrainian", "vietnamese"];
    for (const language of languageNames) {
        const Tokens = language === "russian" ? { source: "Official\u0096localized token", invalid: "Invalid\uFFFDtoken" } : {};
        await writeFile(path.join(fileTracker, "static", `csgo_${language}.json`), JSON.stringify({ lang: { Tokens } }));
    }
    await editJson(output, "ru", "skins.json", data => { data[0].description = "Prefix Official\u0096localized token suffix"; });
    await assert.rejects(validateOutputs(output, reference), /forbidden control character/);
    const report = await validateOutputs(output, reference, { fileTracker });
    assert.equal(report.upstreamTextWarnings.find(issue => issue.locale === "ru").strings, 1);
    await editJson(output, "ru", "skins.json", data => { data[0].description = "Invented\u0096localized token"; });
    await assert.rejects(validateOutputs(output, reference, { fileTracker }), /forbidden control character/);
    await editJson(output, "ru", "skins.json", data => { data[0].description = "Invalid\uFFFDtoken"; });
    await assert.rejects(validateOutputs(output, reference, { fileTracker }), /replacement character/);
});

test("CLI accepts staging-root flags and writes a failure report", async t => {
    const { root, output, reference } = await fixture(t);
    const report = path.join(root, "reports", "validation.json");
    await rm(path.join(output, "tr", "skins.json"));
    const cli = spawnSync(process.execPath, [fileURLToPath(new URL("./validate.mjs", import.meta.url)), "--output", output, "--reference", reference, "--report", report], { encoding: "utf8" });
    assert.equal(cli.status, 1);
    const result = JSON.parse(await readFile(report, "utf8"));
    assert.equal(result.status, "failed");
    assert.match(result.error, /tr.*endpoint files differ/);
});

test("rejects missing locales and missing endpoint files", async t => {
    const { output, reference } = await fixture(t);
    await rm(path.join(output, "ja"), { recursive: true });
    await assert.rejects(validateOutputs(output, reference), /locale directories differ; missing: ja/);
    await mkdir(path.join(output, "ja"));
    await assert.rejects(validateOutputs(output, reference), /ja.*endpoint files differ/);
});

test("rejects malformed JSON and corrupted Unicode text", async t => {
    const { output, reference } = await fixture(t);
    await writeFile(path.join(output, "tr", "skins.json"), "{");
    await assert.rejects(validateOutputs(output, reference), /invalid JSON/);
    await writeFile(path.join(output, "tr", "skins.json"), JSON.stringify([{ ...item, name: "broken\uFFFD" }]));
    await assert.rejects(validateOutputs(output, reference), /replacement character/);
});

test("rejects item loss and replaced IDs", async t => {
    const { output, reference } = await fixture(t);
    await editJson(output, "uk", "skins.json", data => { data.length = 0; });
    await assert.rejects(validateOutputs(output, reference), /item count differs/);
    await writeFile(path.join(output, "uk", "skins.json"), JSON.stringify([{ ...item, id: "skin-wrong" }]));
    await assert.rejects(validateOutputs(output, reference), /item IDs differ/);
});

test("rejects duplicate IDs and accepts item reordering", async t => {
    const { output, reference } = await fixture(t);
    for (const locale of EXPECTED_LOCALES) {
        await editJson(output, locale, "skins.json", data => { data.push({ ...data[0], id: "skin-2" }); });
        if (["en", "zh-CN"].includes(locale)) await writeFile(path.join(reference, "public", "api", locale, "skins.json"), await readFile(path.join(output, locale, "skins.json")));
    }
    await editJson(output, "pl", "skins.json", data => { data.reverse(); });
    await validateOutputs(output, reference);
    await editJson(output, "pl", "skins.json", data => { data[1].id = data[0].id; });
    await assert.rejects(validateOutputs(output, reference), /duplicate item id/);
});

test("rejects files that cannot be published through normal GitHub Git", async t => {
    const { output, reference } = await fixture(t);
    await truncate(path.join(output, "it", "skins.json"), 100 * 1024 * 1024);
    await assert.rejects(validateOutputs(output, reference), /100 MiB per-file limit/);
});

for (const [field, replacement] of [["market_hash_name", "Translated market name"], ["image", "https://example.test/wrong.png"], ["stattrak", false], ["min_float", 0.2]]) {
    test(`rejects changed stable ${field}`, async t => {
        const { output, reference } = await fixture(t);
        await editJson(output, "de", "skins.json", data => { data[0][field] = replacement; });
        await assert.rejects(validateOutputs(output, reference), /stable value differs/);
    });
}

test("rejects original-name or rarity-color changes", async t => {
    const { output, reference } = await fixture(t);
    await editJson(output, "ru", "skins.json", data => { data[0].original.name = "translated_internal_name"; });
    await assert.rejects(validateOutputs(output, reference), /original.name.*stable value differs/);
    await editJson(output, "ru", "skins.json", data => { data[0].original.name = item.original.name; data[0].rarity.color = "#000000"; });
    await assert.rejects(validateOutputs(output, reference), /rarity.color.*stable value differs/);
});

test("rejects mismatched inventory keys, wrong shapes, and empty translated names", async t => {
    const { output, reference } = await fixture(t);
    await editJson(output, "es-ES", "inventory.json", data => { data.skins["8"] = data.skins["7"]; delete data.skins["7"]; });
    await assert.rejects(validateOutputs(output, reference), /object keys differ/);
    await writeFile(path.join(output, "es-ES", "inventory.json"), await readFile(path.join(output, "en", "inventory.json")));
    await editJson(output, "es-ES", "skins.json", data => { data[0].name = ""; });
    await assert.rejects(validateOutputs(output, reference), /empty localized name/);
});

async function templateFixture(t) {
    const root = await mkdtemp(path.join(os.tmpdir(), "csgo-template-test-"));
    t.after(() => rm(root, { recursive: true, force: true }));
    await mkdir(path.join(root, "utils"));
    const templates = Object.fromEntries(SUPPORTED_LOCALES.map(locale => [locale, { example: "{item_name} | {pattern} {pattern}" }]));
    const save = () => writeFile(path.join(root, "utils", "translations.json"), JSON.stringify(templates));
    await save();
    return { root, templates, save };
}

test("audits template coverage and placeholder multisets, allowing word order changes", async t => {
    const { root, templates, save } = await templateFixture(t);
    templates.ja.example = "{pattern} {item_name} {pattern}";
    await save();
    assert.equal((await auditTemplates(root)).templates, 28);
    templates.ja.example = "{pattern} {item_name}";
    await save();
    await assert.rejects(auditTemplates(root), /placeholder names or counts differ/);
});

test("rejects missing template languages, missing keys, malformed braces, and corrupt text", async t => {
    const { root, templates, save } = await templateFixture(t);
    const original = structuredClone(templates.fr);
    delete templates.fr;
    await save();
    await assert.rejects(auditTemplates(root), /fr.*missing locale templates/);
    templates.fr = {};
    await save();
    await assert.rejects(auditTemplates(root), /fr.*template keys differ/);
    templates.fr = { example: "{{item_name} {pattern} {pattern}" };
    await save();
    await assert.rejects(auditTemplates(root), /malformed template braces/);
    templates.fr = { example: original.example + "\u0001" };
    await save();
    await assert.rejects(auditTemplates(root), /forbidden control character/);
});


test("defaults to all existing fork locales without Thai, and resolves exact selected batches", () => {
    assert.equal(EXPECTED_LOCALES.length, 27);
    assert.equal(EXPECTED_LOCALES.includes("th"), false);
    assert.deepEqual(resolveLocales("fr,ru"), ["en", "zh-CN", "ru", "fr"]);
    assert.deepEqual(resolveLocales(["th"]), ["en", "zh-CN", "th"]);
    assert.deepEqual(resolveLocales(["en", "zh-CN"]), ["en", "zh-CN"]);
    for (const selection of ["", "ru,", "all", "ru,ru", ["pt-br"], null, []]) {
        assert.throws(() => resolveLocales(selection), /selection/);
    }
});

test("validates only selected batch output and still checks mirrored bytes and stable metadata", async t => {
    const locales = resolveLocales("fr,ru");
    const { output, reference } = await fixture(t, locales);
    const report = await validateOutputs(output, reference, { locales: ["fr", "ru"] });
    assert.equal(report.locales, 4);
    assert.equal(report.files, 8);
    assert.deepEqual(report.localeCodes, locales);
    await editJson(output, "ru", "skins.json", data => { data[0].image = "changed"; });
    await assert.rejects(validateOutputs(output, reference, { locales }), /stable value differs/);
    await writeFile(path.join(output, "ru", "skins.json"), await readFile(path.join(output, "en", "skins.json")));
    await writeFile(path.join(output, "en", "skins.json"), `${JSON.stringify([item])}\n`);
    await assert.rejects(validateOutputs(output, reference, { locales }), /en.*byte for byte/);
});

test("rejects missing selected batch folders and any unrequested locale folders", async t => {
    const { output, reference } = await fixture(t, resolveLocales("ru"));
    await assert.rejects(validateOutputs(output, reference, { locales: ["ru", "fr"] }), /locale directories differ; missing: fr/);
    await mkdir(path.join(output, "fr"));
    await assert.rejects(validateOutputs(output, reference, { locales: ["ru"] }), /locale directories differ; unexpected: fr/);
});

test("selected batch control evidence needs only selected dictionaries and English fallback", async t => {
    const { root, output, reference } = await fixture(t, resolveLocales("ru"));
    const fileTracker = path.join(root, "file-tracker");
    await mkdir(path.join(fileTracker, "static"), { recursive: true });
    for (const language of ["english", "schinese", "russian"]) {
        const Tokens = language === "russian" ? { source: "Official\u0096localized token" } : {};
        await writeFile(path.join(fileTracker, "static", `csgo_${language}.json`), JSON.stringify({ lang: { Tokens } }));
    }
    await editJson(output, "ru", "skins.json", data => { data[0].description = "Official\u0096localized token"; });
    const report = await validateOutputs(output, reference, { locales: ["ru"], fileTracker });
    assert.equal(report.upstreamTextWarnings.find(issue => issue.locale === "ru").strings, 1);
});

test("CLI accepts an exact language batch and rejects an unrequested folder", async t => {
    const { root, output, reference } = await fixture(t, resolveLocales("ru"));
    const report = path.join(root, "report.json");
    const args = [fileURLToPath(new URL("./validate.mjs", import.meta.url)), "--output", output, "--reference", reference, "--report", report, "--languages", "ru"];
    assert.equal(spawnSync(process.execPath, args, { encoding: "utf8" }).status, 0);
    assert.deepEqual(JSON.parse(await readFile(report, "utf8")).localeCodes, ["en", "zh-CN", "ru"]);
    await mkdir(path.join(output, "th"));
    assert.equal(spawnSync(process.execPath, args, { encoding: "utf8" }).status, 1);
    assert.match(JSON.parse(await readFile(report, "utf8")).error, /unexpected: th/);
});
