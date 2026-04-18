import * as fs from "fs";

import { loadData, getManifestId, getImagesJsonSha } from "./services/main.js";
import { getCollectibles } from "./services/collectibles.js";
import { getKeys } from "./services/keys.js";
import { getAgents } from "./services/agents.js";
import { getCrates } from "./services/crates.js";
import { getCollections } from "./services/collections.js";
import { loadTranslations } from "./services/translations.js";
import { getGraffiti } from "./services/graffiti.js";
import { getPatches } from "./services/patches.js";
import { getStickers } from "./services/stickers.js";
import { getStickerSlabs } from "./services/stickerSlabs.js";
import { getKeychains } from "./services/keychains.js";
import { getSkins } from "./services/skins.js";
import { getLanguages, parseLanguagesArg } from "./utils/languages.js";
import { getMusicKits } from "./services/musicKits.js";
import { getSkinsNotGrouped } from "./services/skinsNotGrouped.js";
import { getTools } from "./services/tools.js";
import { getBaseWeapons } from "./services/baseWeapons.js";
import { getHighlights } from "./services/highlights.js";
import { getInventory } from "./services/inventory.js";

const args = process.argv.slice(2);
const isForce = args.includes("--force");
const codes = parseLanguagesArg(args);

if (codes.length === 0) {
    console.error("Error: no languages specified. Pass --languages en,ru,uk (comma-separated folder codes).");
    process.exit(1);
}

const languages = getLanguages(codes);

if (languages.length === 0) {
    console.error(`Error: none of the provided codes match known languages: ${codes.join(", ")}`);
    process.exit(1);
}

let existingManifestId = "";
let existingImagesSha = "";
const [latestManifestId, latestImagesSha] = await Promise.all([getManifestId(), getImagesJsonSha()]);

try {
    existingManifestId = fs.readFileSync("./manifestIdUpdate.txt", "utf-8");
} catch (err) {
    if (err.code != "ENOENT") {
        throw err;
    }
}

try {
    existingImagesSha = fs.readFileSync("./imagesShaUpdate.txt", "utf-8");
} catch (err) {
    if (err.code != "ENOENT") {
        throw err;
    }
}

if (isForce) {
    console.log("Force flag detected, generating new data regardless of manifest Ids");
} else {
    const manifestChanged = existingManifestId !== latestManifestId;
    const imagesChanged = existingImagesSha !== latestImagesSha;

    if (!manifestChanged && !imagesChanged) {
        console.log("No changes detected in manifest or images.json, exiting");
        process.exit(0);
    }

    if (manifestChanged) {
        console.log("Manifest Id changed, generating new data.");
    }
    if (imagesChanged) {
        console.log("images.json changed, generating new data.");
    }
}

await loadData();

await Promise.all(
    languages.map(async language => {
        console.log(`Language: ${language.language}`);

        try {
            await loadTranslations(language);

            getAgents();
            getCollectibles();
            getCollections();
            getCrates();
            getGraffiti();
            getKeys();
            getMusicKits();
            getPatches();
            getSkins();
            getSkinsNotGrouped();
            getStickers();
            getStickerSlabs();
            getKeychains();
            getTools();
            getBaseWeapons();
            getHighlights();
            getInventory();
        } catch (error) {
            console.log(error);
        }
    })
);

try {
    fs.writeFileSync("./manifestIdUpdate.txt", latestManifestId.toString());
    fs.writeFileSync("./imagesShaUpdate.txt", latestImagesSha.toString());
} catch (err) {
    throw err;
}
