import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from '../public/api/cdn_images.json' assert {type: 'json'};

const isAgent = (item) => item.prefab === "customplayertradable";

const parseItem = (item) => {
    // const image = `${IMAGES_BASE_URL}econ/characters/${item.name.toLocaleLowerCase()}.png`;
    const image = cdn[`econ/characters/${item.name.toLocaleLowerCase()}`];


    return {
        id: `agent-${item.object_id}`,
        name: $t(item.item_name),
        description: $t(item.item_description),
        rarity: $t(`rarity_${item.item_rarity}_character`),
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
