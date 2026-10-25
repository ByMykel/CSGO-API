// Builds the commit message for the bot update by comparing the generated
// JSON in public/api/<lang> against the last commit. Only one language is
// checked since every language has the same items.
import { execFileSync } from "child_process";
import * as fs from "fs";

const API_DIR = "public/api";
// all.json and inventory.json repeat items from the other files
const SKIP = new Set(["all.json", "inventory.json"]);
const MAX_NAMES = 10;

const manifestId = fs.readFileSync("manifestIdUpdate.txt", "utf8").trim();

const pickLanguage = () => {
    const langs = fs.readdirSync(API_DIR).filter(d => fs.statSync(`${API_DIR}/${d}`).isDirectory());
    return langs.includes("en") ? "en" : langs.sort()[0];
};

const readOld = path => {
    try {
        const content = execFileSync("git", ["show", `HEAD:${path}`], {
            encoding: "utf8",
            maxBuffer: 1024 * 1024 * 1024,
            stdio: ["ignore", "pipe", "ignore"],
        });
        return JSON.parse(content);
    } catch {
        return [];
    }
};

const byId = items => new Map(items.map(item => [item.id, item]));

const diffFile = path => {
    const oldItems = byId(readOld(path));
    const newItems = byId(JSON.parse(fs.readFileSync(path, "utf8")));

    const added = [...newItems.keys()].filter(id => !oldItems.has(id));
    const removed = [...oldItems.keys()].filter(id => !newItems.has(id));
    const changed = [...newItems.keys()].filter(
        id => oldItems.has(id) && JSON.stringify(oldItems.get(id)) !== JSON.stringify(newItems.get(id))
    );

    const name = id => (newItems.get(id) ?? oldItems.get(id)).name ?? id;
    return {
        added: added.map(name),
        removed: removed.map(name),
        changed: changed.map(name),
    };
};

const listNames = (label, names) => {
    if (names.length === 0) return [];
    const shown = names.slice(0, MAX_NAMES).map(n => `  - ${n}`);
    if (names.length > MAX_NAMES) shown.push(`  - ...and ${names.length - MAX_NAMES} more`);
    return [`${label}:`, ...shown];
};

const lang = pickLanguage();
const files = fs
    .readdirSync(`${API_DIR}/${lang}`)
    .filter(f => f.endsWith(".json") && !SKIP.has(f))
    .sort();

const totals = { added: 0, removed: 0, changed: 0 };
const sections = [];

for (const file of files) {
    const diff = diffFile(`${API_DIR}/${lang}/${file}`);
    const counts = Object.keys(totals).filter(k => diff[k].length > 0);
    if (counts.length === 0) continue;

    counts.forEach(k => (totals[k] += diff[k].length));
    sections.push(
        [
            `${file.replace(".json", "")}: ${counts.map(k => `${diff[k].length} ${k}`).join(", ")}`,
            ...listNames("Added", diff.added),
            ...listNames("Removed", diff.removed),
            ...listNames("Changed", diff.changed),
        ].join("\n")
    );
}

const summary = Object.keys(totals)
    .filter(k => totals[k] > 0)
    .map(k => `${totals[k]} ${k}`)
    .join(", ");

const subject = `chore(data): manifest ${manifestId} (${summary || "no item changes"})`;
const message = [subject, ...sections].join("\n\n");

if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `message<<EOF_COMMIT_MESSAGE\n${message}\nEOF_COMMIT_MESSAGE\n`
    );
}
console.log(message);
