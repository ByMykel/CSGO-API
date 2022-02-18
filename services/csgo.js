import * as VDF from "vdf-parser";
import axios from "axios";
import {
    ITEMS_GAME_URL,
    CSGO_ENGLISH_URL,
    IMAGES_BASE_URL,
} from "../utils/config.js";
import { weaponsNames, getWeaponName } from "../utils/weapons.js";

const getTranslation = (translations, key) => {
    return translations[key?.replace("#", "").toLowerCase()] ?? "";
};

export const itemsGame = async () => {
    const data = await axios
        .get(ITEMS_GAME_URL)
        .then((response) => response.data);

    return VDF.parse(data);
};

export const translations = async () => {
    const data = await axios
        .get(CSGO_ENGLISH_URL)
        .then((response) => response.data);

    const parsed = VDF.parse(data);

    const lowerCaseKeys = Object.fromEntries(
        Object.entries(parsed.lang.Tokens).map(([key, val]) => [
            key.toLowerCase(),
            val,
        ])
    );

    return lowerCaseKeys;
};

export const prefabs = async () => {
    const prefabs = await itemsGame().then(
        (response) => response.items_game.prefabs
    );
    const allTranslation = await translations();
    const results = [];

    for (const values of Object.values(prefabs)) {
        for (const [weapon, prefab] of Object.entries(values)) {
            if (prefab.item_name === undefined) continue;

            results[weapon] = getTranslation(allTranslation, prefab.item_name);
        }
    }

    return results;
};

export const paintKits = async () => {
    const paintKits = await itemsGame().then(
        (response) => response.items_game.paint_kits
    );
    const allTranslation = await translations();
    const results = [];

    for (const values of Object.values(paintKits)) {
        for (const paint of Object.values(values)) {
            if (paint.description_tag === undefined) continue;

            results[paint.name] =
                getTranslation(allTranslation, paint.description_tag) ||
                getTranslation(allTranslation, `paintkit_${description}`);
        }
    }

    return results;
};

export const items = async () => {
    const items = await itemsGame().then(
        (response) => response.items_game.items
    );
    const allPrefabs = await prefabs();
    const allTranslation = await translations();
    const results = [];

    for (const values of Object.values(items)) {
        for (const item of Object.values(values)) {
            if (item.item_name === undefined) {
                if (item.prefab) {
                    results[item.name] = {
                        ...item,
                        translation_name: allPrefabs[item.prefab],
                        translation_description: "",
                    };
                }

                continue;
            }

            results[item.name] = {
                ...item,
                translation_name: getTranslation(
                    allTranslation,
                    item.item_name
                ),
                translation_description: getTranslation(
                    allTranslation,
                    item.item_description
                ),
            };
        }
    }

    return results;
};

export const skins = async () => {
    const weaponIcons = await itemsGame().then(
        (response) => response.items_game.alternate_icons2.weapon_icons
    );
    const allItems = await items();
    const allPaintKits = await paintKits();
    const results = [];

    for (const values of Object.values(weaponIcons)) {
        const path = values.icon_path.toLowerCase();
        const regex = /econ\/default_generated\/(.*?)_light$/i;

        if (regex.test(path)) {
            const name = path.match(regex);
            const weapon = getWeaponName(name[1]);

            if (weapon) {
                const pattern = name[1].replace(`${weapon}_`, "");

                const translatedName =
                    allItems[weapon]?.translation_name ||
                    allItems[`sfui_wpnhud_${weapon.replace("weapon_", "")}`]
                        ?.translation_name;

                const image = `${IMAGES_BASE_URL}${path}_large.png`;

                results.push({
                    id: results.length + 1,
                    weapon_id: weaponsNames.indexOf(weapon) + 1,
                    weapon: translatedName,
                    pattern: allPaintKits[pattern],
                    image,
                });
            }
        }
    }

    return results;
};

export const collectibles = async () => {
    const allItems = await items();
    const result = [];

    for (const values of Object.values(allItems)) {
        if (values.item_name === undefined) continue;
        if (values.item_name?.indexOf("#CSGO_Collectible") !== -1) {
            result.push({
                id: result.length + 1,
                name: values.translation_name,
                description: values.translation_description,
                image: `${IMAGES_BASE_URL}${values.image_inventory}_large.png`,
            });
        }
    }

    return result;
};

export const stickers = async () => {
    const allItemsGame = await itemsGame().then(
        (response) => response.items_game.sticker_kits
    );
    const allTranslation = await translations();
    const result = [];

    for (const stickers of Object.values(allItemsGame)) {
        for (const [key, sticker] of Object.entries(stickers)) {
            if (sticker.sticker_material === undefined) continue;

            const name = getTranslation(allTranslation, sticker.item_name);
            const description = getTranslation(
                allTranslation,
                sticker.description_string
            );
            const rarity = getTranslation(
                allTranslation,
                `rarity_${sticker.item_rarity?.toLowerCase()}`
            );
            const image = `${IMAGES_BASE_URL}econ/stickers/${sticker.sticker_material.toLowerCase()}_large.png`;

            result.push({
                id: parseInt(key),
                name,
                description,
                rarity,
                image,
            });
        }
    }

    return result;
};
