import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "./saveDataMemory.js";

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

    saveDataMemory(languageData.language, graffiti);
    saveDataJson(`./public/api/${languageData.folder}/graffiti.json`, graffiti);
};
