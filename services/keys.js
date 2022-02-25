import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isKey = (item) => {
    if (item.item_name === undefined) return false;

    if (!item.item_name.startsWith("#CSGO_crate")) {
        return false;
    }

    if (item.item_name.includes("contestwinner")) {
        return false;
    }

    if (!item.prefab.includes("weapon_case_key")) {
        return false;
    }

    return true;
};

const parseItem = (item, translations) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: item.item_name.replace("#CSGO_crate_", ""),
        case_id: item.tool?.restriction?.replace("crate_", "") ?? null,
        name: getTranslation(translations, item.item_name),
        description: item.translation_description,
        image,
    };
};

export const getKeys = (items, translations) => {
    const keys = [];

    Object.values(items).forEach((item) => {
        if (isKey(item)) keys.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/keys.json`, keys);
};
