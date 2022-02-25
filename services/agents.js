import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isAgent = (item) => {
    return item.prefab === "customplayertradable";
};

const parseItem = (item, translations) => {
    const image = `${IMAGES_BASE_URL}econ/characters/${item.name.toLocaleLowerCase()}.png`;

    return {
        id: item.name.toLocaleLowerCase(),
        name: getTranslation(translations, item.item_name),
        description: getTranslation(translations, item.item_description),
        rarity: getTranslation(
            translations,
            `rarity_${item.item_rarity}_character`
        ),
        image,
    };
};

export const getAgents = (items, translations) => {
    const agents = [];

    Object.values(items).forEach((item) => {
        if (isAgent(item)) agents.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/agents.json`, agents);
};
