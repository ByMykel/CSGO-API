import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const isCollectible = (item) => {
    if (item.item_name === undefined) return false;

    if (item.item_name.startsWith("#CSGO_Collectible")) {
        return true;
    }

    if (item.item_name.startsWith("#CSGO_TournamentJournal")) {
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

    if (collectible?.attributes["tournament event id"] !== undefined) {
        if (collectible.item_name.includes("PickEm")) {
            return "Old Pick'Em Trophy";
        }

        if (collectible.item_name.includes("Fantasy")) {
            return "Fantasy Trophy";
        }

        return "Tournament Finalist Trophy";
    }

    if (collectible.item_name.startsWith("#CSGO_Collectible_CommunitySeason")) {
        if (collectible?.prefab === "valve season_tiers") {
            return "Stars for Operation";
        }

        return "Operation Coin";
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
        "Map Contributor Coin": "map_coins.json",
        "Service Medal": "service_medals.json",
        Pin: "pins.json",
    };

    return files[type] ?? "other.json";
};

const parseItem = (item, translations) => {
    const isAttendance = item.prefab === "attendance_pin";
    const image = `${IMAGES_BASE_URL}${item.image_inventory}_large.png`;

    return {
        id: `collectible-${++item.object_id}`,
        name: (isAttendance ? "Genuine " : "") + item.translation_name,
        description: item.translation_description,
        rarity: getTranslation(translations, `rarity_${item.item_rarity}`),
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

export const getCollectibles = (items, translations) => {
    const collectibles = [];

    Object.values(items).forEach((item) => {
        if (isCollectible(item))
            collectibles.push(parseItem(item, translations));
    });

    saveDataJson(
        `./public/api/${translations.language}/collectibles.json`,
        collectibles
    );

    const collectiblesByTypes = groupByType(collectibles);

    Object.entries(collectiblesByTypes).forEach(([type, values]) => {
        saveDataJson(
            `./public/api/${
                translations.language
            }/collectibles/${getFileNameByType(type)}`,
            values
        );
    });
};
