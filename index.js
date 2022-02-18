import { skins, collectibles } from "./services/csgo.js";
import { saveDataJson } from "./services/saveDataJson.js";

(async () => {
    const skinsData = await skins().then((response) => {
        const skins = response.reduce(
            (items, item) => ({
                ...items,
                [item.weapon_id]: {
                    name: item.weapon,
                    skins: [...(items[item.weapon_id]?.skins || []), item],
                },
            }),
            {}
        );

        return JSON.stringify(Object.values(skins), null, 4);
    });
    
    const collectiblesData = await collectibles().then((response) =>
        JSON.stringify(response, null, 4)
    );

    saveDataJson("public/api/skins.json", skinsData);
    saveDataJson("public/api/collectibles.json", collectiblesData);
})();
