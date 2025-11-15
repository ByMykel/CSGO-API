import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import { getCollectibleRarity, getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isCollectible = item => {
    if (item.item_name === undefined) return false;

    if (item.item_name.startsWith("#CSGO_Collectible")) {
        return true;
    }

    if (item.item_name.startsWith("#CSGO_TournamentJournal")) {
        return true;
    }

    if (item.item_name.startsWith("#CSGO_TournamentPass") || item.item_name.startsWith("#CSGO_Ticket_")) {
        return true;
    }

    return false;
};

const getType = collectible => {
    if (collectible.image_inventory.includes("service_medal")) {
        return "Service Medal";
    }

    if (collectible.item_name.startsWith("#CSGO_Collectible_Map")) {
        return "Map Contributor Coin";
    }

    if (collectible.item_name.startsWith("#CSGO_TournamentJournal")) {
        return "Pick'Em Coin";
    }

    if (collectible.item_name.startsWith("#CSGO_Collectible_Pin")) {
        return "Pin";
    }

    if (
        collectible.item_name.startsWith("#CSGO_TournamentPass") &&
        collectible.item_name.endsWith("_charge")
    ) {
        return "Souvenir Token";
    }

    if (collectible.item_name.startsWith("#CSGO_TournamentPass")) {
        return "Tournament Pass";
    }

    if (collectible.item_name.startsWith("#CSGO_Ticket_")) {
        return "Operation Pass";
    }

    if (collectible.item_name.startsWith("#CSGO_Collectible_CommunitySeason")) {
        if (collectible?.prefab === "valve season_tiers") {
            return "Stars for Operation";
        }

        return "Operation Coin";
    }

    if (collectible?.attributes["tournament event id"] !== undefined) {
        if (collectible.item_name.includes("PickEm")) {
            return "Old Pick'Em Trophy";
        }

        if (collectible.item_name.includes("Fantasy")) {
            return "Fantasy Trophy";
        }

        return "Tournament Finalist Trophy";
    }

    if (collectible.prefab === "premier_season_coin") {
        return "Premier Season Coin";
    }

    return null;
};

const getMarketHashName = item => {
    const isAttendance = item.prefab === "attendance_pin";
    const isCannotTrade = item.attributes?.["cannot trade"];

    if (isCannotTrade) {
        return null;
    }

    if (
        ["Pin", "Souvenir Token", "Tournament Pass", "Operation Pass"].includes(getType(item)) &&
        !isAttendance
    ) {
        return $t(item.item_name, true);
    }

    return null;
};

const parseItem = item => {
    const { cdnImages } = state;
    const isAttendance = item.prefab === "attendance_pin";
    const image = cdnImages[item.image_inventory] ?? getImageUrl(item.image_inventory);

    const rarity = item.item_rarity ? `rarity_${item.item_rarity}` : getCollectibleRarity(item?.prefab);

    return {
        id: `collectible-${item.object_id}`,
        name: isAttendance
            ? $tc("collectible_genuine", {
                  genuine: $t("genuine"),
                  item_name: $t(item.item_name),
              })
            : $t(item.item_name),
        description: item.item_description
            ? $t(item.item_description)
            : item.item_description_prefab
              ? $t(item.item_description_prefab)
              : null,
        def_index: item.object_id,
        rarity: {
            id: rarity,
            name: $t(rarity),
            color: getRarityColor(rarity),
        },
        type: getType(item),
        genuine: isAttendance,
        premier_season: item.attributes?.["premier season"],
        market_hash_name: getMarketHashName(item),
        image,

        // Return original attributes from item_game.json
        original: {
            item_name: item.item_name,
            image_inventory: item.image_inventory,
        },
    };
};

export const getCollectibles = async () => {
    const { items } = state;
    const { folder } = languageData;

    const collectibles = Object.values(items)
        .filter(isCollectible)
        .map(parseItem)
        .filter(collectible => collectible.name);

    await saveDataJson(`./public/api/${folder}/collectibles.json`, collectibles);
};
