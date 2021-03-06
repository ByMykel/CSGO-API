import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isCollection = (item) => {
    if (item.is_collection) {
        return true;
    }

    return false;
};

const isSelfOpeningCollection = (item) => {
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

    // Can't really find a way to filter collections
    // if (item.item_type === undefined) {
    //     if (item.translation_name.includes("Collection")) {
    //         return true;
    //     }
    // }

    if (item.item_type === "self_opening_purchase") {
        if (item.prefab.includes("graffiti")) {
            return true;
        }
    }

    return false;
};

const parseItem = (item, translations) => {
    const fileName = `${item.name.replace("#CSGO_", "")}.png`;
    const image = `${IMAGES_BASE_URL}econ/set_icons/${fileName}`;

    return {
        id: `collection-${item.name.replace("#CSGO_", "").replace(/_/g, "-")}`,
        name: getTranslation(translations, item.name),
        image,
    };
};

const parseItemSelfOpening = (item, translations) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `collection-${item.object_id}`,
        name: getTranslation(translations, item.item_name),
        image,
    };
};

export const getCollections = (items, itemSets, translations) => {
    const collections = [];

    Object.values(itemSets).forEach((item) => {
        if (isCollection(item)) collections.push(parseItem(item, translations));
    });

    Object.values(items).forEach((item) => {
        if (isSelfOpeningCollection(item))
            collections.push(parseItemSelfOpening(item, translations));
    });

    saveDataJson(
        `./public/api/${translations.language}/collections.json`,
        collections
    );
};
