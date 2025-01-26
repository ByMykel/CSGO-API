import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getImageUrl } from "../constants.js";
import { getRarityColor } from "../utils/index.js";

const isKeychain = (item) => {
    if (!item.loc_name.startsWith("#keychain_")) {
        return false;
    }

    return true;
};

const getMarketHashName = (item) => {
    return `${$t("CSGO_Tool_Keychain", true)} | ${$t(item.loc_name, true)}`;
};

const parseItem = (item) => {
    const { collectionsBySkins } = state;
    const image = getImageUrl(
        `${item.image_inventory.toLowerCase()}`
    );

    return {
        id: `keychain-${item.object_id}`,
        name: `${$t("CSGO_Tool_Keychain")} | ${$t(item.loc_name)}`,
        description: $t("csgo_tool_keychain_desc"),
        rarity: {
            id: `rarity_${item.item_rarity}`,
            name: $t(`rarity_${item.item_rarity}`),
            color: getRarityColor(`rarity_${item.item_rarity}`),
        },
        collections:
            collectionsBySkins?.[`keychain-${item.object_id}`]?.map((i) => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        market_hash_name: getMarketHashName(item),
        image,
    };
};

export const getKeychains = () => {
    const { keychainDefinitions } = state;
    const { folder } = languageData;

    const keychains = keychainDefinitions.filter(isKeychain).map(parseItem);

    saveDataJson(`./public/api/${folder}/keychains.json`, keychains);
};
