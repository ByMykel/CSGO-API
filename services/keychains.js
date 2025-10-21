import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getImageUrl } from "../constants.js";
import { getRarityColor } from "../utils/index.js";

const isKeychain = item => {
    if (!item.loc_name.startsWith("#keychain_")) {
        return false;
    }

    if (item["is commodity"]) {
        return false;
    }

    return true;
};

const getMarketHashName = item => {
    return `${$t("CSGO_Tool_Keychain", true)} | ${$t(item.loc_name, true)}`;
};

const parseItem = item => {
    const { collectionsBySkins } = state;
    const image = getImageUrl(`${item.image_inventory.toLowerCase()}`);

    return {
        id: `keychain-${item.object_id}`,
        name: `${$t("CSGO_Tool_Keychain")} | ${$t(item.loc_name)}`,
        description: $t("csgo_tool_keychain_desc"),
        def_index: item.object_id,
        rarity: {
            id: `rarity_${item.item_rarity}`,
            name: $t(`rarity_${item.item_rarity}`),
            color: getRarityColor(`rarity_${item.item_rarity}`),
        },
        collections:
            collectionsBySkins?.[`keychain-${item.object_id}`]?.map(i => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        market_hash_name: getMarketHashName(item),
        image,

        // Return original attributes from item_game.json
        original: {
            loc_name: item.loc_name,
            image_inventory: item.image_inventory.toLowerCase(),
        },
    };
};

const parseHighlight = item => {
    const [tournament, highlightType] = item.id.split("_");
    const keychainName = $t(`keychain_kc_${tournament}`);
    const highlightName = $t(`highlightreel_${tournament}_${highlightType}`);
    const keychainNameRaw = $t(`keychain_kc_${tournament}`, true);
    const highlightNameRaw = $t(`highlightreel_${tournament}_${highlightType}`, true);

    return {
        id: `highlight-${item.id}`,
        highlight_reel: item.highlight_reel,
        // TODO: translate Souvenir Charm to other languages
        name: `Souvenir Charm | ${keychainName} | ${highlightName}`,
        description: $t(`highlightdesc_${tournament}_${highlightType}`),
        def_index: null, // TODO: add def_index
        highlight: true,
        rarity: {
            id: "rarity_rare",
            name: $t("rarity_rare"),
            color: getRarityColor("rarity_rare"),
        },
        collections: [],
        market_hash_name: `Souvenir Charm | ${keychainNameRaw} | ${highlightNameRaw}`,
        image: item.image,
    };
};

export const getKeychains = () => {
    const { keychainDefinitions, highlightReels } = state;
    const { folder } = languageData;

    const keychains = keychainDefinitions.filter(isKeychain).map(parseItem);
    const highlights = highlightReels.map(parseHighlight);
    const allKeychains = [...keychains, ...highlights];

    saveDataJson(`./public/api/${folder}/keychains.json`, allKeychains);
};
