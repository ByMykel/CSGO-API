import { IMAGES_BASE_URL } from "../constants.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from '../public/api/cdn_images.json' assert {type: 'json'};

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

const parseItem = (item) => {
    const isAttendance = item.prefab === "attendance_pin";
    // const image = `${IMAGES_BASE_URL}${item.image_inventory}_large.png`;
    const image = cdn[`${item.image_inventory}_large`];

    return {
        id: `collectible-${item.object_id}`,
        name:
            (isAttendance ? `${$translate('genuine')} ` : "") + $translate(item.item_name) ??
            $translate(item_name_prefab),
        description:
            $translate(item.item_description) ??
            $translate(item.item_description_prefab),
        rarity: $translate(`rarity_${item.item_rarity}`),
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
    const collectibles = [];

    const { items } = state;

    Object.values(items).forEach((item) => {
        if (isCollectible(item)) collectibles.push(parseItem(item));
    });

    saveDataMemory(languageData.language, collectibles);
    saveDataJson(`./public/api/${languageData.folder}/collectibles.json`, collectibles);

    const collectiblesByTypes = groupByType(collectibles);

    Object.entries(collectiblesByTypes).forEach(([type, values]) => {
        saveDataMemory(languageData.language, values);
        saveDataJson(
            `./public/api/${languageData.folder}/collectibles/${getFileNameByType(type)}`,
            values
        );
    });
};
