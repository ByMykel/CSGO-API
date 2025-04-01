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

    const marketable = [
        "#CSGO_Tool_WeaponCase_Key",
        "#CSGO_esports_crate_key_1",
        "#CSGO_sticker_crate_key_1",
        "#CSGO_community_crate_key_1",
        "#CSGO_community_crate_key_2",
        "#CSGO_sticker_crate_key_community01",
        "#CSGO_community_crate_key_3",
        "#CSGO_community_crate_key_4",
        "#CSGO_community_crate_key_5",
        "#CSGO_community_crate_key_6",
        "#CSGO_community_crate_key_7",
        "#CSGO_community_crate_key_8",
        "#CSGO_community_crate_key_9",
        "#CSGO_crate_community_10_key",
        "#CSGO_crate_key_community_11",
        "#CSGO_crate_key_community_12",
        "#CSGO_crate_key_community_13",
        "#CSGO_crate_key_gamma_2",
        "#CSGO_crate_key_community_15",
        "#CSGO_crate_key_community_16",
        "#CSGO_crate_key_community_17",
        "#CSGO_crate_key_community_18",
        "#CSGO_crate_key_community_19",
        "#CSGO_crate_key_community_20",
        "#CSGO_crate_key_community_21",
        "#CSGO_crate_key_community_22",
        // "#CSGO_crate_key_community_23",
        "#CSGO_crate_key_community_24",
        // "#CSGO_crate_key_community_25",
        // "#CSGO_crate_key_community_26",
        // "#CSGO_crate_key_community_27",
        // "#CSGO_crate_key_community_28",
        // "#CSGO_crate_key_community_29",
        // "#CSGO_crate_key_community_30",
        // "#CSGO_crate_key_community_31",
        // "#CSGO_crate_key_community_32",
        // "#CSGO_crate_key_community_33",
        // "#CSGO_crate_key_community_34",
        // "#CSGO_crate_key_community_35",
    ]

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
        crates,
        market_hash_name: marketable.includes(item.item_name) ? $t(item.item_name, true) : null,
        marketable: marketable.includes(item.item_name),
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
