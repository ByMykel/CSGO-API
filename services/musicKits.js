import { saveDataJson } from "../utils/saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import { isExclusive } from "../utils/weapon.js";

const parseItem = (item) => {
    const image = cdn[`${item.image_inventory.toLowerCase()}`];
    const exclusive = isExclusive(item.name);

    return {
        id: `music_kit-${item.object_id}`,
        name: exclusive
            ? $translate(item.loc_name)
            : $translate(item.coupon_name),
        description: $translate(item.loc_description),
        rarity: $translate("rarity_rare"),
        exclusive,
        image,
    };
};

export const getMusicKits = () => {
    const { musicDefinitions } = state;
    const musicKits = [];

    musicDefinitions.forEach((item) => {
        musicKits.push(parseItem(item));
    });

    saveDataMemory(languageData.language, musicKits);
    saveDataJson(
        `./public/api/${languageData.folder}/music_kits.json`,
        musicKits
    );
};
