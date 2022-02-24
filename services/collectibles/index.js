import { IMAGES_BASE_URL } from "../../utils/config.js";
import { saveDataJson } from "../../services/saveDataJson.js";

const getTranslation = (translations, key) => {
    const translation = translations[key?.replace("#", "").toLowerCase()];

    if (translation === undefined || translation === "") return null;

    return translation;
};

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
    if (collectible.translation_name.includes("Service Medal")) {
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
        if (collectible.translation_name.includes("Pick'Em")) {
            return "Old Pick'Em Trophy";
        }

        return "Tournament Finalist Trophy";
    }

    if (collectible.item_name.startsWith("#CSGO_Collectible_CommunitySeason")) {
        if (collectible?.prefab === "season_tiers") {
            return "Stars for Operation";
        }

        return "Operation Coin";
    }

    return null;
};

const getId = (item) => {
    const iconFile = /econ\/status_icons\/(.*?)$/i;
    const iconMatch = item.image_inventory?.match(iconFile);
    return iconMatch ? iconMatch[1] : null;
};

const getFileNameByType = (type) => {
    const files = {
        other: "other.json",
        "Tournament Finalist Trophy": "major/finalists_trophies.json",
        "Old Pick'Em Trophy": "major/pickem_old.json",
        "Operation Coin": "operation_coins.json",
        "Map Contributor Coin": "map_coins.json",
        "Service Medal": "service_medals.json",
        Pin: "pins.json",
        "Pick'Em Coin": "major/pickem_coins.json",
    };

    return files[type];
};

const parseItem = (item, translations) => {
    let id = getId(item);
    if (!id) throw new Error(`Could not find id for item ${item.name}`);

    const isAttendance = item.prefab === "attendance_pin";
    const image = `${IMAGES_BASE_URL}${item.image_inventory}_large.png`;

    return {
        id: isAttendance ? `genuine_${id}` : id,
        name: isAttendance
            ? `Genuine ${item.translation_name}`
            : item.translation_name,
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

export const getCollectibles = async (items, translations) => {
    const collectibles = [];

    Object.values(items).forEach((item) => {
        if (isCollectible(item))
            collectibles.push(parseItem(item, translations));
    });

    saveDataJson(`./public/api/collectibles.json`, collectibles);

    const collectiblesByTypes = groupByType(collectibles);

    Object.entries(collectiblesByTypes).forEach(([type, values]) => {
        saveDataJson(
            `./public/api/collectibles/${getFileNameByType(type)}`,
            values
        );
    });
};
