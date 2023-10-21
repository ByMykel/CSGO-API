import {
    getWeaponName,
    isNotWeapon,
    knives,
    getWears,
    getDopplerPhase,
    skinMarketHashName,
    getCategory,
} from "../utils/weapon.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";

import cdn from "../public/api/cdn_images.json" assert { type: "json" };

const getPatternName = (weapon, string) => {
    return string.replace(`${weapon}_`, "").toLowerCase();
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

const parseItem = (item, items) => {
    const { rarities, paintKits, souvenirSkins, stattTrakSkins } = state;
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = cdn[`${item.icon_path.toLowerCase()}_test`]
        ? cdn[`${item.icon_path.toLowerCase()}_test`]
        : cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName = !isNotWeapon(weapon)
        ? $t(items[weapon].item_name_prefab)
        : $t(items[weapon].item_name);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        stattTrakSkins[pattern] !== undefined;
    const isSouvenir = souvenirSkins?.[`skin-${item.object_id}`] ?? false;

    const isKnife =
        weapon.includes("weapon_knife") || weapon.includes("weapon_bayonet");

    const dopplerPhase = getDopplerPhase(paintKits[pattern].paint_index);

    const rarity = !isNotWeapon(weapon)
        ? `rarity_${rarities[`[${pattern}]${weapon}`].rarity}_weapon`
        : isKnife
        ? // Knives are 'Covert'
          `rarity_ancient_weapon`
        : // Gloves are 'Extraordinary'
          `rarity_ancient`;

    // Some skins only exist as souvenir like "MP5-SD | Lab Rats"
    const types = ["hy_labrat_mp5"].includes(pattern) ? [] : ["skin"];

    if (isStatTrak) {
        types.push("skin_stattrak");
    }

    if (isSouvenir) {
        types.push("skin_souvenir");
    }

    const wears = getWears(
        paintKits[pattern].wear_remap_min,
        paintKits[pattern].wear_remap_max
    );

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
                      type === "skin_stattrak"
                          ? "rare_special_with_wear_stattrak"
                          : "rare_special_with_wear",
                      {
                          item_name: translatedName,
                          pattern: $t(paintKits[pattern].description_tag),
                          wear: $t(wear),
                      }
                  )
                : $tc(type, {
                      item_name: translatedName,
                      pattern: $t(paintKits[pattern].description_tag),
                      wear: $t(wear),
                  }),
            weapon: {
                id: weapon,
                name: translatedName,
            },
            category: {
                id: getCategory(weapon),
                name: $t(getCategory(weapon)),
            },
            pattern: {
                id: pattern,
                name: $t(paintKits[pattern].description_tag),
            },
            wear: {
                id: wear,
                name: $t(wear),
            },
            rarity: {
                id: rarity,
                name: $t(rarity),
            },
            ...(dopplerPhase && { phase: dopplerPhase }),
            market_hash_name: skinMarketHashName({
                itemName: !isNotWeapon(weapon)
                    ? $t(items[weapon].item_name_prefab, true)
                    : $t(items[weapon].item_name, true),
                pattern: $t(paintKits[pattern].description_tag, true),
                wear: $t(wear, true),
                isStatTrak: type === "skin_stattrak",
                isSouvenir: type === "skin_souvenir",
                isWeapon: !isNotWeapon(weapon),
                isVanilla: false,
            }),
            image,
        }))
    );
};

export const getSkinsNotGrouped = () => {
    const { itemsGame, items } = state;
    const { folder } = languageData;

    const types = ["rare_special_vanilla", "rare_special_vanilla_stattrak"];

    const skins = [
        ...Object.entries(itemsGame.alternate_icons2.weapon_icons)
            .filter(([, item]) => isSkin(item.icon_path))
            .map(([key, item]) => parseItem({ ...item, object_id: key }, items))
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
                    weapon: {
                        id: `sfui_wpnhud_${knife.name.replace("weapon_", "")}`,
                        name: $t(
                            `sfui_wpnhud_${knife.name.replace("weapon_", "")}`
                        ),
                    },
                    category: {
                        id: "sfui_invpanel_filter_melee",
                        name: $t("sfui_invpanel_filter_melee"),
                    },
                    rarity: {
                        id: `rarity_ancient_weapon`,
                        name: $t(`rarity_ancient_weapon`),
                    },
                    market_hash_name: skinMarketHashName({
                        itemName: $t(knife.item_name, true),
                        pattern: null,
                        wear: null,
                        isStatTrak: type === "rare_special_vanilla_stattrak",
                        isSouvenir: false,
                        isWeapon: false,
                        isVanilla: true,
                    }),
                    image: cdn[`econ/weapons/base_weapons/${knife.name}`],
                }))
            )
            .flatMap((level1) => level1),
    ];

    saveDataJson(`./public/api/${folder}/skins_not_grouped.json`, skins);
};
