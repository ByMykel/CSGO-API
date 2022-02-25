import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isSpray = (item) => {
    if (item.item_name.startsWith("#SprayKit_")) {
        return true;
    }

    return false;
};

const isGraffiti = (item) => {
    if (item.name.includes("crate_graffiti_")) {
        return true;
    }

    return false;
};

const parseItemSpray = (item, translations) => {
    const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material}_large.png`;

    return {
        id: item.item_name.replace("#SprayKit_", ""),
        name: getTranslation(translations, item.item_name),
        description: getTranslation(translations, item.description_string),
        rarity: getTranslation(translations, `rarity_${item.item_rarity}`),
        image,
    };
};

const parseItemSealedGraffiti = (item, translations) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory}_large.png`;

    return {
        id: item.item_name.replace("#StoreItem_", ""),
        name: getTranslation(translations, item.item_name),
        description: getTranslation(translations, item.item_description),
        rarity: null,
        image,
    };
};

export const getGraffiti = (items, stickerKits, translations) => {
    const graffiti = [];

    // All sprays
    stickerKits.forEach((item) => {
        if (isSpray(item)) graffiti.push(parseItemSpray(item, translations));
    });

    // All sealed graffiti
    Object.values(items).forEach((item) => {
        if (isGraffiti(item))
            graffiti.push(parseItemSealedGraffiti(item, translations));
    });

    saveDataJson(`./public/api/graffiti.json`, graffiti);
};
