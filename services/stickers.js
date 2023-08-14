import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
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
    const image =
        cdn[`econ/stickers/${item.sticker_material.toLowerCase()}_large`];

    return {
        id: `sticker-${item.object_id}`,
        name: `${$t("csgo_tool_sticker")} | ${$t(item.item_name)}`,
        description: $t(item.description_string),
        rarity: $t(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getStickers = () => {
    const { stickerKits } = state;
    const { language, folder } = languageData;

    const stickers = stickerKits.filter(isSticker).map(parseItem);

    saveDataMemory(language, stickers);
    saveDataJson(`./public/api/${folder}/stickers.json`, stickers);
};
