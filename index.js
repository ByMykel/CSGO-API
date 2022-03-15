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
} from "./services/csgo.js";
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
import { CSGO_ENGLISH_URL } from "./utils/config.js";
import { getMusicKits } from "./services/musicKits.js";

(async () => {
    const translations = await getTranslations(CSGO_ENGLISH_URL);

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
    getMusicKits(MusicDefinitions);
})();
