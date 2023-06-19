import { IMAGES_BASE_URL } from "../constants.js";
import { getWeaponName, isNotWeapon, knives } from "../utils/weapon.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

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

const getPatternName = (weapon, string) => {
    return (
        string
            .replace(`${weapon}_`, "")
            // .replace("silencer_", "")
            .toLowerCase()
    );
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

const parseItem = (item, items, allStatTrak, paintKits, paintKitsRarity) => {
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    // const image = `${IMAGES_BASE_URL}${item.icon_path.toLowerCase()}_large.png`;
    const image = cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName =
        $translate(items[weapon].item_name) ??
        $translate(items[weapon].item_name_prefab);
    const translatedDescription =
        $translate(items[weapon].item_description) ??
        $translate(items[weapon].item_description_prefab);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        allStatTrak[pattern] !== undefined;

    return {
        id: `skin-${item.object_id}`,
        name: `${translatedName} | ${$translate(
            paintKits[pattern].description_tag
        )}`,
        description: translatedDescription,
        weapon: translatedName,
        pattern: $translate(paintKits[pattern].description_tag),
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity:
            (!isNotWeapon(weapon)
                ? $translate(`rarity_${paintKitsRarity[pattern]}_weapon`)
                : weapon.includes("weapon_knife") ||
                  weapon.includes("weapon_bayonet")
                ? $translate(`rarity_ancient_weapon`)
                : $translate(`rarity_ancient`)) ?? "Contraband",
        stattrak: isStatTrak,
        paint_index: paintKits[pattern].paint_index,
        image,
    };
};

export const getSkins = () => {
    const { itemsGame, items, paintKits, itemSets, paintKitsRarity } = state;

    const allStatTrak = getAllStatTrak(itemSets, items);
    const skins = [];

    Object.entries(itemsGame.alternate_icons2.weapon_icons).forEach(
        ([key, item]) => {
            if (isSkin(item.icon_path))
                skins.push(
                    parseItem(
                        { ...item, object_id: key },
                        items,
                        allStatTrak,
                        paintKits,
                        paintKitsRarity
                    )
                );
        }
    );

    knives.forEach((knife) => {
        skins.push({
            id: `skin-vanilla-${knife.name}`,
            name: $translate(knife.item_name),
            description: $translate(knife.item_description),
            weapon: $translate(`sfui_wpnhud_${knife.name.replace('weapon_', '')}`),
            pattern: null,
            min_float: null,
            max_float: null,
            rarity: $translate(`rarity_ancient_weapon`),
            stattrak: true,
            paint_index: null,
            image: cdn[`econ/weapons/base_weapons/${knife.name}`]
        });
    });

    saveDataMemory(languageData.language, skins);
    saveDataJson(`./public/api/${languageData.folder}/skins.json`, skins);
};
