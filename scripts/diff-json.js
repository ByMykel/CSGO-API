// Shows which items were added, removed or changed in the generated JSON
// between two git refs. The files are minified so a normal git diff is
// unreadable.
//
// Items that got the exact same change are grouped together, so a field
// that changed on 400 skins shows up once with the list of skins under it.
// Lists inside an item are matched by id and the id is ignored when
// grouping, so the same crate image change on many stickers shows as one
// crates[*].image change.
//
// By default only en is shown and all.json / inventory.json are skipped,
// since they repeat the items from the other files.
//
// npm run diff-json                                  changed files, HEAD~1 -> HEAD
// npm run diff-json -- public/api/en/skins.json      only these files
// npm run diff-json -- --from abc123 --to HEAD       other refs
// npm run diff-json -- --manifest 239443625111074552 changes from that manifest's commits
// npm run diff-json -- --lang zh-CN                  another language
// npm run diff-json -- --all                         every language and file
// npm run diff-json -- --full                        no truncated lists or values
// npm run diff-json -- --summary                     counts only
import { execFileSync } from "child_process";
import { styleText } from "util";

const API_DIR = "public/api/";
const REPEATED_FILES = new Set(["all.json", "inventory.json"]);
const MAX_NAMES = 15;
const MAX_VALUE = 120;

const args = process.argv.slice(2);
const opts = { from: "HEAD~1", to: "HEAD", lang: "en", all: false, full: false, summary: false, files: [] };
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--from") opts.from = args[++i];
    else if (arg === "--to") opts.to = args[++i];
    else if (arg === "--manifest") opts.manifest = args[++i];
    else if (arg === "--lang") opts.lang = args[++i];
    else if (arg === "--all") opts.all = true;
    else if (arg === "--full") opts.full = true;
    else if (arg === "--summary") opts.summary = true;
    else opts.files.push(arg.replace(/\\/g, "/"));
}

const color = (style, text) => styleText(style, String(text), { stream: process.stdout });

const git = gitArgs =>
    execFileSync("git", gitArgs, {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 1024,
        stdio: ["ignore", "pipe", "ignore"],
    });

const load = (ref, path) => {
    try {
        return JSON.parse(git(["show", `${ref}:${path}`]));
    } catch {
        return null;
    }
};

// The bot commits are named "chore(data): manifest <id> (...)". A manifest
// can be split over several commits, so compare the commit before the first
// one against the last one.
if (opts.manifest) {
    const commits = git(["log", "--format=%h", "--fixed-strings", `--grep=manifest ${opts.manifest} `])
        .split("\n")
        .filter(Boolean);
    if (commits.length === 0) {
        console.error(`No commit found for manifest ${opts.manifest}`);
        process.exit(1);
    }
    opts.to = commits[0];
    opts.from = `${commits[commits.length - 1]}~1`;
}

const isObject = v => v !== null && typeof v === "object" && !Array.isArray(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hasIds = arr => arr.length > 0 && arr.every(x => isObject(x) && x.id !== undefined);

// Arrays are matched by item id, objects by key
const toMap = data => {
    if (Array.isArray(data)) return new Map(data.map((item, i) => [item?.id ?? `[${i}]`, item]));
    if (isObject(data)) return new Map(Object.entries(data));
    return new Map();
};

// Returns the changed leaves as { path, before, after }. Arrays of objects
// with ids are matched by id, so one changed crate inside a sticker shows as
// crates[crate-5317].image instead of the whole array.
const fieldChanges = (a, b, path = "", out = []) => {
    if (same(a, b)) return out;
    const join = key => (path ? `${path}.${key}` : key);

    if (isObject(a) && isObject(b)) {
        for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
            fieldChanges(a[key], b[key], join(key), out);
    } else if (Array.isArray(a) && Array.isArray(b) && (hasIds(a) || hasIds(b))) {
        const before = toMap(a);
        const after = toMap(b);
        for (const id of new Set([...before.keys(), ...after.keys()])) {
            fieldChanges(before.get(id), after.get(id), `${path}[${id}]`, out);
        }
    } else if (
        Array.isArray(a) &&
        Array.isArray(b) &&
        [...a, ...b].every(x => !isObject(x) && !Array.isArray(x))
    ) {
        const added = b.filter(x => !a.includes(x));
        const removed = a.filter(x => !b.includes(x));
        if (added.length || removed.length) out.push({ path, added, removed });
        else out.push({ path, before: a, after: b }); // same values, new order
    } else {
        out.push({ path: path || "(value)", before: a, after: b });
    }
    return out;
};

const shorten = text => {
    if (opts.full || text.length <= MAX_VALUE) return text;
    const keep = Math.floor((MAX_VALUE - 3) / 2);
    return `${text.slice(0, keep)}...${text.slice(-keep)}`;
};

const show = value => (value === undefined ? color("dim", "(none)") : shorten(JSON.stringify(value)));

const itemName = (key, item) => {
    const name = isObject(item) && typeof item.name === "string" ? item.name : null;
    return name && name !== key ? `${name} ${color("dim", `(${key})`)}` : key;
};

const printNames = (names, indent) => {
    const shown = opts.full ? names : names.slice(0, MAX_NAMES);
    for (const name of shown) console.log(`${indent}${name}`);
    if (shown.length < names.length) {
        console.log(color("dim", `${indent}...and ${names.length - shown.length} more (use --full)`));
    }
};

const printChange = change => {
    console.log(`    ${color("yellow", change.path)}`);
    if ("added" in change) {
        for (const v of change.removed) console.log(color("red", `      - ${show(v)}`));
        for (const v of change.added) console.log(color("green", `      + ${show(v)}`));
    } else {
        console.log(color("red", `      - ${show(change.before)}`));
        console.log(color("green", `      + ${show(change.after)}`));
    }
};

const pickFiles = () => {
    if (opts.files.length) return opts.files;

    const changed = git(["diff", "--name-only", opts.from, opts.to, "--", "*.json"])
        .split("\n")
        .filter(Boolean);
    if (opts.all) return changed.sort();

    return changed
        .filter(file => {
            if (!file.startsWith(API_DIR)) return true;
            const [lang, name] = file.slice(API_DIR.length).split("/");
            return lang === opts.lang && !REPEATED_FILES.has(name);
        })
        .sort();
};

const files = pickFiles();
if (files.length === 0) {
    console.log(`No JSON changes between ${opts.from} and ${opts.to}`);
    process.exit(0);
}

console.log(color("dim", `Comparing ${opts.from} -> ${opts.to}`));

for (const file of files) {
    const before = toMap(load(opts.from, file));
    const after = toMap(load(opts.to, file));

    const added = [...after.keys()].filter(k => !before.has(k));
    const removed = [...before.keys()].filter(k => !after.has(k));
    const changed = [...after.keys()].filter(k => before.has(k) && !same(before.get(k), after.get(k)));

    const counts = [
        added.length && color("green", `+${added.length} added`),
        removed.length && color("red", `-${removed.length} removed`),
        changed.length && color("yellow", `~${changed.length} changed`),
    ].filter(Boolean);

    console.log(
        `\n${color(["bold", "cyan"], `━━ ${file}`)}  ${counts.join("  ") || color("dim", "no item changes")}`
    );
    if (opts.summary) continue;

    if (added.length) {
        console.log(color(["bold", "green"], `\n  Added (${added.length})`));
        printNames(
            added.map(k => itemName(k, after.get(k))),
            "    "
        );
    }

    if (removed.length) {
        console.log(color(["bold", "red"], `\n  Removed (${removed.length})`));
        printNames(
            removed.map(k => itemName(k, before.get(k))),
            "    "
        );
    }

    if (changed.length) {
        // Group items whose changes are identical. Ids inside paths are ignored,
        // so "crates[crate-5316].image" and "crates[crate-4040].image" with the
        // same values count as one change: crates[*].image
        const groups = new Map();
        for (const k of changed) {
            const seen = new Set();
            const changes = fieldChanges(before.get(k), after.get(k))
                .map(change => ({ ...change, path: change.path.replace(/\[[^\]]+\]/g, "[*]") }))
                .filter(change => {
                    const key = JSON.stringify(change);
                    return !seen.has(key) && seen.add(key);
                });
            const signature = JSON.stringify(changes);
            if (!groups.has(signature)) groups.set(signature, { changes, names: [] });
            groups.get(signature).names.push(itemName(k, after.get(k)));
        }

        console.log(color(["bold", "yellow"], `\n  Changed (${changed.length})`));
        for (const { changes, names } of [...groups.values()].sort(
            (a, b) => b.names.length - a.names.length
        )) {
            console.log();
            changes.forEach(printChange);
            console.log(color("dim", `    in ${names.length} item${names.length === 1 ? "" : "s"}:`));
            printNames(names, "      ");
        }
    }
}
