import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isCollection = (item) => {
    if (item.is_collection) {
        return true;
    }

    if (item.item_type === "self_opening_purchase") {
        if (item.translation_name.includes("Collection")) {
            return true;
        }
    }

    return false;
};

const parseItem = (item, translations) => {
    const fileName = `${item.name.replace("#CSGO_", "")}.png`;
    const image = `${IMAGES_BASE_URL}econ/set_icons/${fileName}`;

    return {
        id: item.name.replace("#CSGO_", ""),
        name: getTranslation(translations, item.name),
        image,
    };
};

export const getCollections = (itemSets, translations) => {
    const collections = [];

    Object.values(itemSets).forEach((item) => {
        if (isCollection(item)) collections.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/collections.json`, collections);
};
