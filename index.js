import { loadData } from "./services/main.js";
import { getCollectibles } from "./services/collectibles.js";
import { getKeys } from "./services/keys.js";
import { getAgents } from "./services/agents.js";
import { getCrates } from "./services/crates.js";
import { getCollections } from "./services/collections.js";
import { loadTranslations } from "./services/translations.js";
import { getGraffiti } from "./services/graffiti.js";
import { getPatches } from "./services/patches.js";
import { getStickers } from "./services/stickers.js";
import { getSkins } from "./services/skins.js";
import { LANGUAGES_URL } from "./utils/config.js";
import { getMusicKits } from "./services/musicKits.js";
import { getAllItems } from "./services/getAllItems.js";

await loadData();

for (const language of LANGUAGES_URL) {
    await loadTranslations({ lang: language.language, url: language.url });

    console.log(`\n${language.language.toUpperCase()}`);

    getCollectibles();
    getKeys();
    getAgents();
    getCrates();
    getCollections();
    getGraffiti();
    getPatches();
    getStickers();
    getSkins();
    getMusicKits();

    await getAllItems();
}
