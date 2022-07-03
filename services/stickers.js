import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isSticker = (item) => {
    if (item.sticker_material === undefined) {
        return false;
    }

    if (!item.item_name.startsWith("#StickerKit_")) {
        return false;
    }

    if (item.name.includes("graffiti")) {
        return false;
    }

    if (item.name.includes("spray_")) {
        return false;
    }

    return true;
};

const parseItem = (item, translations) => {
    const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material.toLowerCase()}_large.png`;

    return {
        id: `sticker-${item.object_id}`,
        name: `Sticker | ${getTranslation(translations, item.item_name)}`,
        description: getTranslation(translations, item.description_string),
        rarity: getTranslation(translations, `rarity_${item.item_rarity}`),
        image,
    };
};

export const getStickers = (stickerKits, translations) => {
    const stickers = [];

    stickerKits.forEach((item) => {
        if (isSticker(item)) stickers.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/${translations.language}/stickers.json`, stickers);
};
