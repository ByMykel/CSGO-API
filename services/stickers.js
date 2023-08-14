import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

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

const parseItem = (item) => {
    // const image = `${IMAGES_BASE_URL}econ/stickers/${item.sticker_material.toLowerCase()}_large.png`;
    const image = cdn[`econ/stickers/${item.sticker_material.toLowerCase()}_large`];

    return {
        id: `sticker-${item.object_id}`,
        name: `Sticker | ${$t(item.item_name)}`,
        description: $t(item.description_string),
        rarity: $t(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getStickers = () => {
    const { stickerKits } = state;
    const stickers = [];

    stickerKits.forEach((item) => {
        if (isSticker(item)) stickers.push(parseItem(item));
    });

    saveDataMemory(languageData.language, stickers);
    saveDataJson(`./public/api/${languageData.folder}/stickers.json`, stickers);
};
