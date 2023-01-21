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
import { saveAllItems } from "./services/all.js";

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
        getStickers();

        saveAllItems(language.language, language.folder);
    } catch (error) {
        console.log(error);
    }
}
