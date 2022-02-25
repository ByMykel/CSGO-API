import { items, translations } from "./services/csgo.js";
import { getCollectibles } from "./services/collectibles.js";
import { getKeys } from "./services/keys.js";

(async () => {
    const allItems = await items();
    const allTranslations = await translations();

    getCollectibles(allItems, allTranslations);
    getKeys(allItems, allTranslations);
})();
