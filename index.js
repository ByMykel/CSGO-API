import { skins, collectibles } from "./services/csgo.js";
import { saveDataJson } from "./services/saveDataJson.js";

(async () => {
    const skinsData = await skins().then(response => JSON.stringify(response, null, 4));
    const collectiblesData = await collectibles().then(response => JSON.stringify(response, null, 4));

    saveDataJson("public/api/skins.json", skinsData);
    saveDataJson("public/api/collectibles.json", collectiblesData);
})();
