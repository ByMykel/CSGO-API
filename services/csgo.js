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
        if (item.item_name === undefined) {
            if (item.prefab) {
                results[item.name] = {
                    ...item,
                    translation_name: prefabs[item.prefab],
                    translation_description: null,
                };
            }

            continue;
        }

        results[item.name] = {
            ...item,
            translation_name: getTranslation(translations, item.item_name),
            translation_description: getTranslation(
                translations,
                item.item_description
            ),
        };
    }

    return results;
};

export const getPrefabs = (itemsGame, translations) => {
    const results = [];

    for (const [key, prefab] of parseObjectEntries(itemsGame.prefabs)) {
        if (prefab.item_name === undefined) continue;

        results[key] = getTranslation(translations, prefab.item_name);
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
            results[item.name.toLowerCase()] = getTranslation(
                translations,
                item.description_tag
            );
        }
    });

    return results;
};
