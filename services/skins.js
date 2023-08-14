import {
    getWeaponName,
    isNotWeapon,
    knives,
    getCategory,
    getWears,
} from "../utils/weapon.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
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

const parseItem = (item, items, allStatTrak, paintKits) => {
    const { rarities } = state;
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName =
        $t(items[weapon].item_name) ?? $t(items[weapon].item_name_prefab);
    const translatedDescription =
        $t(items[weapon].item_description) ??
        $t(items[weapon].item_description_prefab);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        allStatTrak[pattern] !== undefined;

    const isKnife =
        weapon.includes("weapon_knife") || weapon.includes("weapon_bayonet");

    const rarity = !isNotWeapon(weapon)
        ? $t(`rarity_${rarities[`[${pattern}]${weapon}`].rarity}_weapon`)
        : isKnife
        ? // Knives are 'Covert'
          $t(`rarity_ancient_weapon`)
        : // Gloves are 'Extraordinary'
          $t(`rarity_ancient`);

    return {
        id: `skin-${item.object_id}`,
        name: `${translatedName} | ${$t(paintKits[pattern].description_tag)}`,
        description: translatedDescription,
        weapon: translatedName,
        category: $t(getCategory(weapon)),
        pattern: $t(paintKits[pattern].description_tag),
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity,
        stattrak: isStatTrak,
        paint_index: paintKits[pattern].paint_index,
        wears: getWears(
            paintKits[pattern].wear_remap_min,
            paintKits[pattern].wear_remap_max
        ).map($t),
        image,
    };
};

export const getSkins = () => {
    const { itemsGame, items, paintKits, itemSets } = state;
    const { language, folder } = languageData;

    const allStatTrak = getAllStatTrak(itemSets, items);
    const skins = [
        ...Object.entries(itemsGame.alternate_icons2.weapon_icons)
            .filter(([, item]) => isSkin(item.icon_path))
            .map(([key, item]) =>
                parseItem(
                    { ...item, object_id: key },
                    items,
                    allStatTrak,
                    paintKits
                )
            ),
        ...knives.map((knife) => ({
            id: `skin-vanilla-${knife.name}`,
            name: $t(knife.item_name),
            description: $t(knife.item_description),
            weapon: $t(`sfui_wpnhud_${knife.name.replace("weapon_", "")}`),
            category: $t("sfui_invpanel_filter_melee"),
            pattern: null,
            min_float: null,
            max_float: null,
            rarity: $t(`rarity_ancient_weapon`),
            stattrak: true,
            paint_index: null,
            image: cdn[`econ/weapons/base_weapons/${knife.name}`],
        })),
    ];

    saveDataMemory(language, skins);
    saveDataJson(`./public/api/${folder}/skins.json`, skins);
};
