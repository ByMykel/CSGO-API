import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

const isKey = (item) => {
    if (item.item_name === undefined) return false;

    // if (!item.item_name.startsWith("#CSGO_crate")) {
    //     return false;
    // }

    // if (item.item_name.includes("contestwinner")) {
    //     return false;
    // }

    if (!item?.prefab?.includes("weapon_case_key")) {
        return false;
    }

    return true;
};

const parseItem = (item) => {
    const image = cdn[item.image_inventory.toLowerCase()];

    return {
        id: `key-${item.object_id}`,
        // case_id: item.tool?.restriction?.replace("crate_", "") ?? null,
        name: $t(item.item_name) ?? $t(item_name_prefab),
        description:
            $t(item.item_description) ?? $t(item.item_description_prefab),
        image,
    };
};

export const getKeys = () => {
    const { items } = state;
    const { language, folder } = languageData;

    const keys = Object.values(items).filter(isKey).map(parseItem);

    saveDataMemory(language, keys);
    saveDataJson(`./public/api/${folder}/keys.json`, keys);
};
