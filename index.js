import {
    getItems,
    getItemsById,
    getItemSets,
    getItemsGame,
    getMusicDefinitions,
    getPaintKits,
    getPaintKitsRarity,
    getPrefabs,
    getStickerKits,
} from "./services/main.js";
import { getCollectibles } from "./services/collectibles.js";
import { getKeys } from "./services/keys.js";
import { getAgents } from "./services/agents.js";
import { getCrates } from "./services/crates.js";
import { getCollections } from "./services/collections.js";
import { getTranslations } from "./services/translations.js";
import { getGraffiti } from "./services/graffiti.js";
import { getPatches } from "./services/patches.js";
import { getStickers } from "./services/stickers.js";
import { getSkins } from "./services/skins.js";
import { LANGUAGES_URL, CSGO_ENGLISH_URL } from "./utils/config.js";
import { getMusicKits } from "./services/musicKits.js";
import { getAllItems } from "./services/getAllItems.js";

(async () => {
    const englishTranslation = await getTranslations(CSGO_ENGLISH_URL);

    for (const language of LANGUAGES_URL) {
        const selectedTranslations = await getTranslations(language.url);

        const translations = {
            language: language.language === "english" ? "" : language.language,
            default: englishTranslation,
            selected: selectedTranslations,
        };

        console.log(`%c${language.language.toUpperCase()}`, "color: #8cb4ff");

        const itemsGame = await getItemsGame();

        const prefabs = getPrefabs(itemsGame, translations);
        const items = getItems(itemsGame, prefabs, translations);

        const itemsById = getItemsById(itemsGame, prefabs, translations);
        const itemSets = getItemSets(itemsGame);
        const stickerKits = getStickerKits(itemsGame);
        const paintKits = getPaintKits(itemsGame, translations);
        const paintKitsRarity = getPaintKitsRarity(itemsGame);
        const MusicDefinitions = getMusicDefinitions(itemsGame, translations);

        getCollectibles(items, translations);
        getKeys(items, translations);
        getAgents(items, translations);
        getCrates(items, itemsById, prefabs, translations);
        getCollections(items, itemSets, translations);
        getGraffiti(items, stickerKits, translations);
        getPatches(stickerKits, translations);
        getStickers(stickerKits, translations);
        getSkins(
            itemsGame,
            items,
            paintKits,
            itemSets,
            paintKitsRarity,
            translations
        );
        getMusicKits(MusicDefinitions, translations.language);
        getAllItems(translations.language);
    }
})();
