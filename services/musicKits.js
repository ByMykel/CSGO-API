import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `music-kit-${item.object_id}`,
        name: item.translation_name,
        description: item.translation_description,
        rarity: "High Grade",
        exclusive: item.exclusive,
        image,
    };
};

export const getMusicKits = (MusicDefinitions, language) => {
    const musicKits = [];

    Object.values(MusicDefinitions).forEach((item) => {
        musicKits.push(parseItem(item));
    });

    saveDataJson(`./public/api/${language}/music_kits.json`, musicKits);
};
