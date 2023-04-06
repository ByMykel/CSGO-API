import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from '../public/api/cdn_images.json' assert {type: 'json'};

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
    // const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;
    const image = cdn[item.image_inventory.toLowerCase()];

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

    saveDataMemory(languageData.language, keys);
    saveDataJson(`./public/api/${languageData.folder}/keys.json`, keys);
};
