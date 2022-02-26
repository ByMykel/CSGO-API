import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isCrate = (item) => {
    if (item.item_name === undefined) return false;

    if (!item.item_name.startsWith("#CSGO_crate")) {
        return false;
    }

    if (item.item_name.includes("#CSGO_crate_tool_stattrak_swap")) {
        return false;
    }

    if (item.prefab?.includes("weapon_case_key")) {
        return false;
    }

    if (item.item_type === "self_opening_purchase") {
        return false;
    }

    if (item.translation_name.includes('Collection')) {
        return false;
    }

    return true;
};

const parseItem = (item, translations) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: item.item_name.replace("#CSGO_crate_", ""),
        collection_id: item.tags?.ItemSet?.tag_value ?? null,
        name: getTranslation(translations, item.item_name),
        description: item.translation_description,
        image,
    };
};

export const getCrates = (items, translations) => {
    const crates = [];

    Object.values(items).forEach((item) => {
        if (isCrate(item)) crates.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/crates.json`, crates);
};
