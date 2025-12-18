import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isAgent = item => item.prefab === "customplayertradable";

const cleanAgentName = name => {
    // Fix double spaces around pipe for items with incorrect Steam data
    if (typeof name !== 'string') return name;
    return name.replace(/\s*\|\s*/g, ' | ');
};

const parseItem = item => {
    const { collectionsBySkins, cdnImages } = state;

    const image =
        cdnImages[`econ/characters/${item.name.toLocaleLowerCase()}`] ??
        getImageUrl(`econ/characters/${item.name.toLocaleLowerCase()}`);

    return {
        id: `agent-${item.object_id}`,
        name: cleanAgentName($t(item.item_name)),
        description: $t(item.item_description),
        def_index: item.object_id,
        rarity: {
            id: `rarity_${item.item_rarity}_character`,
            name: $t(`rarity_${item.item_rarity}_character`),
            color: getRarityColor(`rarity_${item.item_rarity}_character`),
        },
        collections: collectionsBySkins?.[`agent-${item.object_id}`]?.map(i => ({
            ...i,
            name: $t(i.name),
        })),
        team: {
            id: Object.keys(item.used_by_classes)[0],
            name:
                Object.keys(item.used_by_classes)[0] === "counter-terrorists"
                    ? $t("inv_filter_ct")
                    : $t("inv_filter_t"),
        },
        market_hash_name: cleanAgentName($t(item.item_name, true)),
        image,
        model_player: item.model_player ?? null,

        // Return original attributes from item_game.json
        original: {
            name: item.name,
            image_inventory: `econ/characters/${item.name.toLocaleLowerCase()}`,
        },
    };
};

export const getAgents = async () => {
    const { items } = state;
    const { folder } = languageData;

    const agents = Object.values(items).filter(isAgent).map(parseItem);

    await saveDataJson(`./public/api/${folder}/agents.json`, agents);
};
