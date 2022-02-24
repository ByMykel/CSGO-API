import { items, translations } from "./services/csgo.js";
import { getCollectibles } from "./services/collectibles/index.js";
import { getKeys } from "./services/keys/index.js";

(async () => {
    const allItems = await items();
    const allTranslations = await translations();

    getCollectibles(allItems, allTranslations);
    getKeys(allItems, allTranslations);
})();
