import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, language } from "./translations.js";
import { state } from "./main.js";

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

const parseItemSealedGraffiti = (item) => {
    const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material}_large.png`;

    return {
        id: `graffiti-${item.object_id}`,
        name: $translate(item.item_name),
        description: $translate(item.description_string),
        rarity: $translate(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getGraffiti = () => {
    const { stickerKits } = state;

    const graffiti = [];

    stickerKits.forEach((item) => {
        if (isGraffiti(item)) graffiti.push(parseItemSealedGraffiti(item));
    });

    saveDataJson(`./public/api/${language}/graffiti.json`, graffiti);
};
