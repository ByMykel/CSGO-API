import {
    skins,
    stickers,
    collectibles,
    collections,
    cases,
    keys,
} from "./services/csgo.js";
import { saveDataJson } from "./services/saveDataJson.js";

(async () => {
    const functions = [skins, stickers, collectibles, collections, cases, keys];

    for (const i in functions) {
        const data = await functions[i]();
        const json = JSON.stringify(data, null, 4);

        saveDataJson(`public/api/${functions[i].name}.json`, json);
    }
})();
