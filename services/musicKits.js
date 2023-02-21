import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "./saveDataMemory.js";

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;
    const exclusive = $translate(item.coupon_name) === null;

    return {
        id: `music-kit-${item.object_id}`,
        name: exclusive
            ? $translate(item.loc_name)
            : $translate(item.coupon_name),
        description: $translate(item.loc_description),
        rarity: "High Grade",
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
    saveDataJson(`./public/api/${languageData.folder}/music_kits.json`, musicKits);
};
