import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: item.name,
        name: item.translation_name,
        description: item.translation_description,
        rarity: "High Grade",
        image,
    };
};

export const getMusicKits = (MusicDefinitions) => {
    const musicKits = [];

    Object.values(MusicDefinitions).forEach((item) => {
        musicKits.push(parseItem(item));
    });

    saveDataJson(`./public/api/music_kits.json`, musicKits);
};
