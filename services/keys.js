import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getImageUrl } from "../constants.js";

const isKey = (item) => {
    if (item.item_name === undefined) {
        return false;
    }

    if (item.item_name.includes("contestwinner")) {
        return false;
    }

    if (item.item_name.includes("storepromo_key")) {
        return false;
    }

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
    const { items } = state;

    const image = getImageUrl(item.image_inventory.toLowerCase());
    const crates = Object.values(items)
        .filter(
            (crate) =>
                ["sticker_capsule", "weapon_case"].includes(crate.prefab) &&
                crate?.tool?.restriction === item.tool?.restriction
        )
        .map((crate) => ({
            id: `crate-${crate.object_id}`,
            name: $t(crate.item_name),
            image: getImageUrl(crate.image_inventory.toLowerCase()),
        }));

    return {
        id: `key-${item.object_id}`,
        name: $t(item.item_name),
        description:
            $t(item.item_description) ?? $t(item.item_description_prefab),
        market_hash_name: $t(item.item_name, true),
        crates,
        image,
    };
};

export const getKeys = () => {
    const { items } = state;
    const { folder } = languageData;

    const seen = {};
    const keys = [
        // Hardcoded generic valve key that I can't find in `items`.
        {
            object_id: "generic_valve_key",
            item_name: "#CSGO_Tool_WeaponCase_Key",
            item_description: "#CSGO_Tool_WeaponCase_Key_Desc",
            image_inventory: "econ/tools/weapon_case_key",
            tool: {
                restriction: "generic_valve_key",
            },
        },
        ...Object.values(items).filter(isKey),
    ]
        .map(parseItem)
        .filter(({ name, image }) => {
            // Filter repeted keys
            // https://github.com/ByMykel/CSGO-API/issues/107
            if (seen[image]) {
                return false;
            }
            seen[image] = true;
            return name;
        });

    saveDataJson(`./public/api/${folder}/keys.json`, keys);
};
