import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "./saveDataMemory.js";

const isAgent = (item) => item.prefab === "customplayertradable";

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}econ/characters/${item.name.toLocaleLowerCase()}.png`;

    return {
        id: `agent-${item.object_id}`,
        name: $translate(item.item_name),
        description: $translate(item.item_description),
        rarity: $translate(`rarity_${item.item_rarity}_character`),
        image,
    };
};

export const getAgents = () => {
    const { items } = state;
    const agents = [];

    Object.values(items).forEach((item) => {
        if (isAgent(item)) agents.push(parseItem(item));
    });

    saveDataMemory(languageData.language, agents);
    saveDataJson(`./public/api/${languageData.folder}/agents.json`, agents);
};
