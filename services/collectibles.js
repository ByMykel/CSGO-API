import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import { getCollectibleRarity } from "../utils/weapon.js";

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

    return null;
};

const getFileNameByType = (type) => {
    const files = {
        other: "other.json",
        "Tournament Finalist Trophy": "major/finalists_trophies.json",
        "Old Pick'Em Trophy": "major/pickem_old.json",
        "Pick'Em Coin": "major/pickem_coins.json",
        "Fantasy Trophy": "major/fantasy_trophies.json",
        "Operation Coin": "operation/coins.json",
        "Stars for Operation": "operation/stars.json",
        Pass: "operation/pass.json",
        "Map Contributor Coin": "map_coins.json",
        "Service Medal": "service_medals.json",
        Pin: "pins.json",
    };

    return files[type] ?? "other.json";
};

const parseItem = (item) => {
    const isAttendance = item.prefab === "attendance_pin";
    const image = item.item_name.startsWith("#CSGO_Ticket_")
        ? cdn[`${item.image_inventory}`]
        : cdn[`${item.image_inventory}_large`];

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
        },
        type: getType(item),
        image,
    };
};

const groupByType = (collectibles) => {
    return collectibles.reduce(
        (items, item) => ({
            ...items,
            [item.type ?? "other"]: [
                ...(items[item.type ?? "other"] || []),
                item,
            ],
        }),
        {}
    );
};

export const getCollectibles = () => {
    const { items } = state;
    const { folder } = languageData;

    const collectibles = Object.values(items)
        .filter(isCollectible)
        .map(parseItem);

    saveDataJson(`./public/api/${folder}/collectibles.json`, collectibles);

    const collectiblesByTypes = groupByType(collectibles);

    Object.entries(collectiblesByTypes).forEach(([type, values]) => {
        saveDataJson(
            `./public/api/${folder}/collectibles/${getFileNameByType(type)}`,
            values
        );
    });
};
