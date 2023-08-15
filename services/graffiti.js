import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

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
    const image = cdn[`econ/stickers/${item.sticker_material}_large`];

    return {
        id: `graffiti-${item.object_id}`,
        name: `${$t("csgo_tool_spray")} | ${$t(item.item_name)}`,
        description: $t(item.description_string),
        rarity: $t(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getGraffiti = () => {
    const { stickerKits } = state;
    const { language, folder } = languageData;

    const graffiti = stickerKits
        .filter(isGraffiti)
        .map(parseItemSealedGraffiti);

    saveDataMemory(language, graffiti);
    saveDataJson(`./public/api/${folder}/graffiti.json`, graffiti);
};
