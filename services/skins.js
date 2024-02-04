import {
    getWeaponName,
    isNotWeapon,
    knives,
    getCategory,
    getWears,
    getDopplerPhase,
    getRarityColor,
} from "../utils/index.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };

const getPatternName = (weapon, string) => {
    return string.replace(`${weapon}_`, "").toLowerCase();
};

const isSkin = (iconPath) => {
    if (iconPath.includes("newcs2")) {
        return false;
    }

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
    const {
        rarities,
        paintKits,
        cratesBySkins,
        souvenirSkins,
        collectionsBySkins,
    } = state;
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = cdn[`${item.icon_path.toLowerCase()}_test`]
        ? cdn[`${item.icon_path.toLowerCase()}_test`]
        : cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName = !isNotWeapon(weapon)
        ? $t(items[weapon].item_name_prefab)
        : $t(items[weapon].item_name);
    let translatedDescription = !isNotWeapon(weapon)
        ? $t(items[weapon].item_description_prefab)
        : $t(items[weapon].item_description);

    // Add paint kit description
    if (pattern.includes('_')) {
        const split = pattern.split('_');
        const paint_kit = `#PaintKit_${split[0]}_${split[1]}`;
        const desc = $t(paint_kit);
        if (desc && desc.length > 0) {
            translatedDescription = `${translatedDescription}\\n\\n${desc}`;
        }
    }

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        state.stattTrakSkins[`[${pattern}]${weapon}`] !== undefined;

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

    const team =
        !items[weapon].used_by_classes ||
        Object.keys(items[weapon].used_by_classes).length === 2
            ? "both"
            : Object.keys(items[weapon].used_by_classes)[0];

    return {
        id: `skin-${item.object_id}`,
        name: isNotWeapon(weapon)
            ? $tc("rare_special", {
                  item_name: translatedName,
                  pattern: $t(paintKits[pattern].description_tag),
              })
            : `${translatedName} | ${$t(paintKits[pattern].description_tag)}`,
        description: translatedDescription,
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
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity: {
            id: rarity,
            name: $t(rarity),
            color: getRarityColor(rarity),
        },
        stattrak: isStatTrak,
        souvenir: souvenirSkins?.[`skin-${item.object_id}`] ?? false,
        paint_index: paintKits[pattern].paint_index,
        wears: getWears(
            paintKits[pattern].wear_remap_min,
            paintKits[pattern].wear_remap_max
        ).map((wearKey) => ({ id: wearKey, name: $t(wearKey) })),
        collections:
            collectionsBySkins?.[`skin-${item.object_id}`]?.map((i) => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        crates:
            cratesBySkins?.[`skin-${item.object_id}`]?.map((i) => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        ...(dopplerPhase && { phase: dopplerPhase }),
        special_notes: specialNotes?.[`skin-${item.object_id}`],
        team: {
            id: team,
            name:
                team === "both"
                    ? $t("inv_filter_both_teams")
                    : team === "counter-terrorists"
                    ? $t("inv_filter_ct")
                    : $t("inv_filter_t"),
        },
        image,
    };
};

export const getSkins = () => {
    const { itemsGame, items, cratesBySkins } = state;
    const { folder } = languageData;

    const skins = [
        ...Object.entries(itemsGame.alternate_icons2.weapon_icons)
            .filter(([, item]) => isSkin(item.icon_path))
            .map(([key, item]) =>
                parseItem({ ...item, object_id: key }, items)
            ),
        ...knives.map((knife) => ({
            id: `skin-vanilla-${knife.name}`,
            name: $tc("rare_special_vanilla", {
                item_name: $t(knife.item_name),
            }),
            description: $t(knife.item_description),
            weapon: {
                id: knife.item_name,
                name: $t(knife.item_name),
            },
            category: {
                id: "sfui_invpanel_filter_melee",
                name: $t("sfui_invpanel_filter_melee"),
            },
            pattern: null,
            min_float: null,
            max_float: null,
            rarity: {
                id: `rarity_ancient_weapon`,
                name: $t(`rarity_ancient_weapon`),
                color: getRarityColor("rarity_ancient_weapon"),
            },
            stattrak: true,
            paint_index: null,
            crates:
                cratesBySkins[`skin-vanilla-${knife.name}`]?.map((i) => ({
                    ...i,
                    name: $t(i.name),
                })) ?? [],
            team: {
                id: "both",
                name: $t("inv_filter_both_teams"),
            },
            image: cdn[`econ/weapons/base_weapons/${knife.name}`],
        })),
    ].filter((skin) => !skin.name.includes("null"));

    saveDataJson(`./public/api/${folder}/skins.json`, skins);
};
