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
    const skinsData = await skins().then((response) =>
        JSON.stringify(response, null, 4)
    );

    const stickersData = await stickers().then((response) =>
        JSON.stringify(response, null, 4)
    );

    const collectiblesData = await collectibles().then((response) =>
        JSON.stringify(response, null, 4)
    );

    const collectionsData = await collections().then((response) =>
        JSON.stringify(response, null, 4)
    );

    const casesData = await cases().then((response) =>
        JSON.stringify(response, null, 4)
    );

    const keysData = await keys().then((response) =>
        JSON.stringify(response, null, 4)
    );

    saveDataJson("public/api/skins.json", skinsData);
    saveDataJson("public/api/stickers.json", stickersData);
    saveDataJson("public/api/collectibles.json", collectiblesData);
    saveDataJson("public/api/collections.json", collectionsData);
    saveDataJson("public/api/cases.json", casesData);
    saveDataJson("public/api/keys.json", keysData);
})();
