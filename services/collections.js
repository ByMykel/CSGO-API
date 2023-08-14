import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

const isCollection = (item) => item.is_collection !== undefined;

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

const parseItem = (item) => {
    const fileName = `${item.name.replace("#CSGO_", "")}`;
    // const image = `${IMAGES_BASE_URL}econ/set_icons/${fileName}`;
    const image = cdn[`econ/set_icons/${fileName}`];

    return {
        id: `collection-${item.name.replace("#CSGO_", "").replace(/_/g, "-")}`,
        name: $t(item.name),
        image,
    };
};

const parseItemSelfOpening = (item) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `collection-${item.object_id}`,
        name: $t(item.item_name),
        image,
    };
};

export const getCollections = () => {
    const { items, itemSets } = state;

    const collections = [];

    Object.values(itemSets).forEach((item) => {
        if (isCollection(item)) collections.push(parseItem(item));
    });

    Object.values(items).forEach((item) => {
        if (isSelfOpeningCollection(item))
            collections.push(parseItemSelfOpening(item));
    });

    saveDataMemory(languageData.language, collections);
    saveDataJson(`./public/api/${languageData.folder}/collections.json`, collections);
};
