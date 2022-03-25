import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

let id_count = 0;

const isPatch = (item) => {
    if (item.patch_material === undefined) {
        return false;
    }

    return true;
};

const parseItem = (item, translations) => {
    const image = `${IMAGES_BASE_URL}econ/patches/${item.patch_material}_large.png`;

    return {
        id: `patch-${++id_count}`,
        name: `Patch | ${getTranslation(translations, item.item_name)}`,
        description: getTranslation(translations, item.description_string),
        rarity: getTranslation(translations, `rarity_${item.item_rarity}`),
        image,
    };
};

export const getPatches = (stickerKits, translations) => {
    const patches = [];

    stickerKits.forEach((item) => {
        if (isPatch(item)) patches.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/patches.json`, patches);
};
