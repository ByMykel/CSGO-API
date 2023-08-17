import {
    getWeaponName,
    isNotWeapon,
    knives,
    getWears,
    getDopplerPhase,
} from "../utils/weapon.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
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

const parseItem = (item, items, allStatTrak) => {
    const { rarities, paintKits, souvenirSkins } = state;
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName = !isNotWeapon(weapon)
        ? $t(items[weapon].item_name_prefab)
        : $t(items[weapon].item_name);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        allStatTrak[pattern] !== undefined;
    const isSouvenir = souvenirSkins?.[`skin-${item.object_id}`] ?? false;

    const isKnife =
        weapon.includes("weapon_knife") || weapon.includes("weapon_bayonet");

    const dopplerPhase = getDopplerPhase(paintKits[pattern].paint_index);

    const rarity = !isNotWeapon(weapon)
        ? $t(`rarity_${rarities[`[${pattern}]${weapon}`].rarity}_weapon`)
        : isKnife
        ? // Knives are 'Covert'
          $t(`rarity_ancient_weapon`)
        : // Gloves are 'Extraordinary'
          $t(`rarity_ancient`);

    const types = ["skin"];

    if (isStatTrak) {
        types.push("skin_stattrak");
    }

    if (isSouvenir) {
        types.push("skin_souvenir");
    }

    const wears = getWears(
        paintKits[pattern].wear_remap_min,
        paintKits[pattern].wear_remap_max
    ).map($t);

    return types.map((type) =>
        wears.map((wear, index) => ({
            id: `skin-${item.object_id}_${index}${
                type === "skin_stattrak"
                    ? "_st"
                    : type === "skin_souvenir"
                    ? "_so"
                    : ""
            }`,
            skin_id: `skin-${item.object_id}`,
            name: isNotWeapon(weapon)
                ? $tc(
                      isStatTrak
                          ? "rare_special_with_wear_stattrak"
                          : "rare_special_with_wear",
                      {
                          item_name: translatedName,
                          pattern: $t(paintKits[pattern].description_tag),
                          wear,
                      }
                  )
                : $tc(type, {
                      item_name: translatedName,
                      pattern: $t(paintKits[pattern].description_tag),
                      wear,
                  }),
            weapon: translatedName,
            pattern: $t(paintKits[pattern].description_tag),
            rarity,
            ...(dopplerPhase && { phase: dopplerPhase }),
            image,
        }))
    );
};

export const getSkinsNotGrouped = () => {
    const { itemsGame, items, itemSets } = state;
    const { language, folder } = languageData;

    const allStatTrak = getAllStatTrak(itemSets, items);
    const types = ["rare_special_vanilla", "rare_special_vanilla_stattrak"];

    const skins = [
        ...Object.entries(itemsGame.alternate_icons2.weapon_icons)
            .filter(([, item]) => isSkin(item.icon_path))
            .map(([key, item]) =>
                parseItem({ ...item, object_id: key }, items, allStatTrak)
            )
            .flatMap((level1) => level1.flatMap((level2) => level2)),
        ...types
            .map((type) =>
                knives.map((knife) => ({
                    id: `skin-vanilla-${knife.name}${
                        type === "rare_special_vanilla_stattrak" ? "_st" : ""
                    }`,
                    name: $tc(type, {
                        item_name: $t(knife.item_name),
                    }),
                    weapon: $t(
                        `sfui_wpnhud_${knife.name.replace("weapon_", "")}`
                    ),
                    rarity: $t(`rarity_ancient_weapon`),
                    image: cdn[`econ/weapons/base_weapons/${knife.name}`],
                }))
            )
            .flatMap((level1) => level1),
    ];

    saveDataMemory(language, skins);
    saveDataJson(`./public/api/${folder}/skins_not_grouped.json`, skins);
};
