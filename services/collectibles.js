import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import { getCollectibleRarity, getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isCollectible = (item) => {
    if (item.item_name === undefined) return false;

    if (item.item_name.startsWith("#CSGO_Collectible")) {
        return true;
    }

    if (item.item_name.startsWith("#CSGO_TournamentJournal")) {
        return true;
    }

    if (
        item.item_name.startsWith("#CSGO_TournamentPass") ||
        item.item_name.startsWith("#CSGO_Ticket_")
    ) {
        return true;
    }

    return false;
};

const getType = (collectible) => {
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
        collectible.item_name.startsWith("#CSGO_TournamentPass") ||
        collectible.item_name.startsWith("#CSGO_Ticket_")
    ) {
        return "Pass";
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

const parseItem = (item) => {
    const isAttendance = item.prefab === "attendance_pin";
    const image = getImageUrl(item.image_inventory);

    const rarity = item.item_rarity
        ? `rarity_${item.item_rarity}`
        : getCollectibleRarity(item?.prefab);

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
        rarity: {
            id: rarity,
            name: $t(rarity),
            color: getRarityColor(rarity),
        },
        type: getType(item),
        genuine: isAttendance,
        market_hash_name:
            ["Pass", "Pin"].includes(getType(item)) && !isAttendance
                ? $t(item.item_name, true)
                : null,
        image,
    };
};

export const getCollectibles = () => {
    const { items } = state;
    const { folder } = languageData;

    const collectibles = Object.values(items)
        .filter(isCollectible)
        .map(parseItem)
        .filter((collectible) => collectible.name);

    saveDataJson(`./public/api/${folder}/collectibles.json`, collectibles);
};
