import * as fs from "fs";

import { loadData, getManifestId } from "./services/main.js";
import { getCollectibles } from "./services/collectibles.js";
import { getKeys } from "./services/keys.js";
import { getAgents } from "./services/agents.js";
import { getCrates } from "./services/crates.js";
import { getCollections } from "./services/collections.js";
import { loadTranslations } from "./services/translations.js";
import { getGraffiti } from "./services/graffiti.js";
import { getPatches } from "./services/patches.js";
import { getStickers } from "./services/stickers.js";
import { getKeychains } from "./services/keychains.js";
import { getSkins } from "./services/skins.js";
import { LANGUAGES_URL } from "./constants.js";
import { getMusicKits } from "./services/musicKits.js";
import { getSkinsNotGrouped } from "./services/skinsNotGrouped.js";
import { getTools } from "./services/tools.js";

const args = process.argv.slice(2);
const isForce = args.includes('--force');

let existingManifestId = "";
const latestManifestId = await getManifestId();

try {
    existingManifestId = fs.readFileSync("./manifestIdUpdate.txt");
} catch (err) {
    if (err.code != "ENOENT") {
        throw err;
    }
}

if (isForce) {
    console.log("Force flag detected, generating new data regardless of manifest Ids")
} else {
    if (existingManifestId == latestManifestId) {
        console.log("Latest manifest Id matches existing manifest Id, exiting");
        process.exit(0);
    } else {
        console.log(
            "Latest manifest Id does not match existing manifest Id, generating new data."
        );
    }
}

await loadData();

for (const language of LANGUAGES_URL) {
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
        getKeychains();
        getTools();
    } catch (error) {
        console.log(error);
    }
}

try {
    fs.writeFileSync("./manifestIdUpdate.txt", latestManifestId.toString());
} catch (err) {
    throw err;
}
