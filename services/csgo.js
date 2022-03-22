import * as VDF from "vdf-parser";
import axios from "axios";
import { ITEMS_GAME_URL } from "../utils/config.js";
import { getTranslation } from "./translations.js";

export const parseObjectValues = (items) => {
    const result = [];

    for (const values of Object.values(items)) {
        for (const value of Object.values(values)) {
            result.push(value);
        }
    }

    return Object.values(result);
};

export const parseObjectEntries = (items) => {
    const result = [];

    for (const values of Object.values(items)) {
        for (const [key, value] of Object.entries(values)) {
            result[key] = value;
        }
    }

    return Object.entries(result);
};

export const getItemsGame = async () => {
    const { data } = await axios.get(ITEMS_GAME_URL);

    return VDF.parse(data).items_game;
};

export const getItemSets = (itemsGame) => {
    return parseObjectValues(itemsGame.item_sets);
};

export const getStickerKits = (itemsGame) => {
    return parseObjectValues(itemsGame.sticker_kits);
};

export const getItems = (itemsGame, prefabs, translations) => {
    const results = [];

    for (const item of parseObjectValues(itemsGame.items)) {
        let translation_name =
            getTranslation(translations, item.item_name) ??
            prefabs[item.prefab]?.item_name;
        let translation_description =
            getTranslation(translations, item.item_description) ??
            prefabs[item.prefab]?.item_description;

        results[item.name] = {
            ...item,
            translation_name,
            translation_description,
        };
    }

    return results;
};

export const getItemsById = (itemsGame, prefabs, translations) => {
    const results = [];

    for (const [id, item] of parseObjectEntries(itemsGame.items)) {
        let translation_name =
            getTranslation(translations, item.item_name) ??
            prefabs[item.prefab]?.item_name;
        let translation_description =
            getTranslation(translations, item.item_description) ??
            prefabs[item.prefab]?.item_description;

        results[id] = {
            ...item,
            translation_name,
            translation_description,
        };
    }

    return results;
};

export const getPrefabs = (itemsGame, translations) => {
    const results = [];

    for (const [key, prefab] of parseObjectEntries(itemsGame.prefabs)) {
        results[key] = {
            item_name: getTranslation(translations, prefab.item_name),
            item_description: getTranslation(
                translations,
                prefab.item_description
            ),
            first_sale_date: prefab.first_sale_date ?? null,
        };
    }

    return results;
};

export const getPaintKitsRarity = (itemsGame) => {
    const results = [];

    parseObjectEntries(itemsGame.paint_kits_rarity).forEach(
        ([pattern, rarity]) => {
            results[pattern.toLocaleLowerCase()] = rarity;
        }
    );

    return results;
};

export const getPaintKits = (itemsGame, translations) => {
    const results = [];

    parseObjectValues(itemsGame.paint_kits).forEach((item) => {
        if (item.description_tag !== undefined) {
            results[item.name.toLowerCase()] = {
                description_tag: getTranslation(
                    translations,
                    item.description_tag
                ),
                wear_remap_min: item.wear_remap_min ?? 0.06,
                wear_remap_max: item.wear_remap_max ?? 0.8,
            };
        }
    });

    return results;
};

export const getMusicDefinitions = (itemsGame, translations) => {
    const results = [];

    parseObjectValues(itemsGame.music_definitions).forEach((item) => {
        if (item.name !== "valve_csgo_01" && item.name !== "valve_csgo_02") {
            const exclusive =
                getTranslation(translations, `coupon_${item.name}`) === null;

            results.push({
                ...item,
                translation_name: exclusive
                    ? getTranslation(translations, item.loc_name)
                    : getTranslation(translations, `coupon_${item.name}`),
                translation_description: getTranslation(
                    translations,
                    item.loc_description
                ),
                exclusive,
            });
        }
    });

    return results;
};
