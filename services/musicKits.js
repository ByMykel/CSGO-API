import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, language } from "./translations.js";
import { state } from "./main.js";

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

    saveDataJson(`./public/api/${language}/music_kits.json`, musicKits);
};
