import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";

let id_count = 0;

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `music-kit-${++id_count}`,
        name: item.translation_name,
        description: item.translation_description,
        rarity: "High Grade",
        exclusive: item.exclusive,
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
