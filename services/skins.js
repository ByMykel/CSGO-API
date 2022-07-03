import { IMAGES_BASE_URL } from "../utils/config.js";
import { getWeaponName } from "../utils/weapons.js";
import { saveDataJson } from "./saveDataJson.js";
import { getTranslation } from "./translations.js";

const getAllStatTrak = (itemSets, items) => {
    const crates = {};

    Object.values(items).forEach((item) => {
        if (item.prefab === "weapon_case") {
            const name = item?.tags?.ItemSet?.tag_value;

            if (name !== undefined) {
                crates[name] = true;
            }
        }
    });

    const result = {};

    itemSets.forEach((item) => {
        if (item.is_collection) {
            const keys = Object.keys(item.items).map((item) => {
                const pattern = item.match(/\[(.*?)\]/i);

                if (pattern) {
                    return pattern[1];
                }

                return item;
            });

            keys.forEach((key) => {
                if (crates[item.name.replace("#CSGO_", "")] !== undefined) {
                    result[key.toLocaleLowerCase()] = true;
                }
            });
        }
    });

    return result;
};

const getSkinsCollections = (itemSets, translations) => {
    const result = {};

    itemSets.forEach((item) => {
        if (item.is_collection) {
            const keys = Object.keys(item.items).map((item) => {
                const pattern = item.match(/\[(.*?)\]/i);

                if (pattern) {
                    return pattern[1];
                }

                return item;
            });

            keys.forEach((key) => {
                result[key.toLocaleLowerCase()] = {
                    id: item.name.replace("#CSGO_", ""),
                    name: getTranslation(translations, item.name),
                };
            });
        }
    });

    return result;
};

const getPatternName = (weapon, string) => {
    return string
        .replace(`${weapon}_`, "")
        .replace("silencer_", "")
        .toLowerCase();
};

const isSkin = (iconPath) => {
    const regexSkinId = /econ\/default_generated\/(.*?)_light$/i;

    return regexSkinId.test(iconPath.toLowerCase());
};

const getSkinInfo = (iconPath) => {
    const regexSkinId = /econ\/default_generated\/(.*?)_light$/i;
    const path = iconPath.toLowerCase();
    const skinId = path.match(regexSkinId);

    const weapon = getWeaponName(skinId[1]);
    const pattern = getPatternName(weapon, skinId[1]);

    return [weapon, pattern];
};

const parseItem = (
    item,
    items,
    skinsCollections,
    allStatTrak,
    paintKits,
    paintKitsRarity,
    translations
) => {
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = `${IMAGES_BASE_URL}${item.icon_path.toLowerCase()}_large.png`;
    const translatedName = items[weapon].translation_name;
    const translatedDescription = items[weapon].translation_description;

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        allStatTrak[pattern] !== undefined;

    return {
        id: `skin-${item.object_id}`,
        // collection_id: skinsCollections[pattern]?.id ?? null,
        name: `${translatedName} | ${paintKits[pattern].description_tag}`,
        description: translatedDescription,
        weapon: translatedName,
        pattern: paintKits[pattern].description_tag ?? null,
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity:
            getTranslation(
                translations,
                `rarity_${paintKitsRarity[pattern]}_weapon`
            ) ?? "Contraband",
        stattrak: isStatTrak,
        image,
    };
};

export const getSkins = (
    itemsGame,
    items,
    paintKits,
    itemSets,
    paintKitsRarity,
    translations
) => {
    const skinsCollections = getSkinsCollections(itemSets, translations);
    const allStatTrak = getAllStatTrak(itemSets, items);
    const skins = [];

    Object.entries(itemsGame.alternate_icons2.weapon_icons).forEach(
        ([key, item]) => {
            if (isSkin(item.icon_path))
                skins.push(
                    parseItem(
                        { ...item, object_id: key },
                        items,
                        skinsCollections,
                        allStatTrak,
                        paintKits,
                        paintKitsRarity,
                        translations
                    )
                );
        }
    );

    saveDataJson(`./public/api/${translations.language}/skins.json`, skins);
};
