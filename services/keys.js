import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, language } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "./saveDataMemory.js";

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

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `key-${item.object_id}`,
        // case_id: item.tool?.restriction?.replace("crate_", "") ?? null,
        name: $translate(item.item_name) ?? $translate(item_name_prefab),
        description:
            $translate(item.item_description) ??
            $translate(item.item_description_prefab),
        image,
    };
};

export const getKeys = () => {
    const { items } = state;
    const keys = [];

    Object.values(items).forEach((item) => {
        if (isKey(item)) keys.push(parseItem(item));
    });

    saveDataMemory(language, keys);
    saveDataJson(`./public/api/${language}/keys.json`, keys);
};
