import * as VDF from "vdf-parser";
import axios from "axios";
import { weaponsNames, getWeaponName } from "../utils/weapons.js";

const getTranslation = (translations, key) => {
    return translations[key?.replace("#", "").toLowerCase()] ?? "";
};

export const itemsGame = async () => {
    const data = await axios
        .get(
            "https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/scripts/items/items_game.txt"
        )
        .then((r) => r.data);

    return VDF.parse(data);
};

export const translations = async () => {
    const data = await axios
        .get(
            "https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/resource/csgo_english.txt"
        )
        .then((r) => r.data);

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

    for (const [key, value] of Object.entries(prefabs)) {
        for (const [weapon, prefab] of Object.entries(value)) {
            const name = prefab.item_name?.replace("#", "").toLowerCase();
            if (name === undefined) continue;

            results[weapon] = allTranslation[name];
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

    for (const [key, value] of Object.entries(paintKits)) {
        for (const [key, paint] of Object.entries(value)) {
            const description = paint.description_tag
                ?.replace("#", "")
                .toLowerCase();

            if (description === undefined) continue;

            results[paint.name] =
                allTranslation[description] ||
                allTranslation[`paintkit_${description}`];
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

    for (const [key, value] of Object.entries(items)) {
        for (const [key, item] of Object.entries(value)) {
            const name = item.item_name?.replace("#", "").toLowerCase();
            const description = item.item_description
                ?.replace("#", "")
                .toLowerCase();

            if (name === undefined) {
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
                translation_name: allTranslation[name],
                translation_description: allTranslation[description],
            };
        }
    }

    return results;
};

export const skins = async () => {
    const weaponIcons = await itemsGame().then(
        (r) => r.items_game.alternate_icons2.weapon_icons
    );
    const allItems = await items();
    const allPaintKits = await paintKits();
    const results = [];

    for (const [key, value] of Object.entries(weaponIcons)) {
        const path = value.icon_path.toLowerCase();
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

                results.push({
                    id: results.length + 1,
                    weapon_id: weaponsNames.indexOf(weapon) + 1,
                    weapon: translatedName,
                    pattern: allPaintKits[pattern],
                    image: `https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/pak01_dir/resource/flash/${path}_large.png`,
                });
            }
        }
    }

    // results = results.reduce(
    //     (items, item) => ({
    //         ...items,
    //         [item.weapon_id]: {
    //             name: item.weapon,
    //             skins: [...(items[item.weapon_id]?.skins || []), item],
    //         },
    //     }),
    //     {}
    // );

    return results;
};

export const collectibles = async () => {
    const allItems = await items();
    const result = [];

    for (const [key, value] of Object.entries(allItems)) {
        if (value.item_name === undefined) continue;
        if (value.item_name?.indexOf("#CSGO_Collectible") !== -1) {
            result.push({
                id: result.length + 1,
                name: value.translation_name,
                description: value.translation_description,
                image: `https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/pak01_dir/resource/flash/${value.image_inventory}_large.png`,
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
            const image = `https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/pak01_dir/resource/flash/econ/stickers/${sticker.sticker_material.toLowerCase()}_large.png`;

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
