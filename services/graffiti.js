import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isGraffiti = (item) => {
    if (item.item_name.startsWith("#SprayKit_")) {
        return true;
    }

    if (item.name.includes("spray_")) {
        return true;
    }
    
    if (item.sticker_material?.includes("_graffiti")) {
        return true;
    }

    return false;
};

const parseItemSealedGraffiti = (item, translations) => {
    const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material}_large.png`;

    return {
        id: `graffiti-${item.object_id}`,
        name: getTranslation(translations, item.item_name),
        description: getTranslation(translations, item.description_string),
        rarity: getTranslation(translations, `rarity_${item.item_rarity}`),
        image,
    };
};

export const getGraffiti = (items, stickerKits, translations) => {
    const graffiti = [];

    stickerKits.forEach((item) => {
        if (isGraffiti(item)) graffiti.push(parseItemSealedGraffiti(item, translations));
    });

    saveDataJson(`./public/api/${translations.language}/graffiti.json`, graffiti);
};
