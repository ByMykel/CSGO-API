import {
    getWeaponName,
    isNotWeapon,
    knives,
    getCategory,
    getWears,
    getDopplerPhase,
    getRarityColor,
    weaponIDMapping,
} from "../utils/index.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tTag, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import specialNotes from "../utils/specialNotes.json" with { type: "json" };
import { getImageUrl } from "../constants.js";

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

const getDescription = (desc, paintKits, pattern) => {
    const pattern_desc = $t(`#PaintKit_${pattern}`);
    if (pattern_desc && pattern_desc.length > 0) {
        return `${desc} ${pattern_desc}`;
    }

    const tag = paintKits[pattern]?.description_tag
        .toLowerCase()
        .replace("_tag", "");
    const tag_desc = $t(tag);
    if (tag_desc && tag_desc.length > 0) {
        return `${desc} ${tag_desc}`;
    }

    const idx_desc = $tTag(paintKits[pattern]?.description_tag);
    if (idx_desc && idx_desc.length > 0) {
        return `${desc} ${idx_desc}`;
    }

    return desc;
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
    const image = getImageUrl(item.icon_path.toLowerCase());
    const translatedName = !isNotWeapon(weapon)
        ? $t(items[weapon].item_name_prefab)
        : $t(items[weapon].item_name);
    const translatedDescription = !isNotWeapon(weapon)
        ? $t(items[weapon].item_description_prefab)
        : $t(items[weapon].item_description);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        state.stattTrakSkins[`[${pattern}]${weapon}`] !== undefined;

    const isKnife =
        weapon.includes("weapon_knife") || weapon.includes("weapon_bayonet");

    const dopplerPhase = getDopplerPhase(paintKits[pattern]?.paint_index);

    const rarity = !isNotWeapon(weapon)
        ? (rarities[`[${pattern}]${weapon}`]?.rarity ? `rarity_${rarities[`[${pattern}]${weapon}`]?.rarity}_weapon` : null)
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
                  pattern: $t(paintKits[pattern]?.description_tag),
              })
            : `${translatedName} | ${$t(paintKits[pattern]?.description_tag)}`,
        description: getDescription(translatedDescription, paintKits, pattern),
        weapon: {
            id: weapon,
            weapon_id: weaponIDMapping[weapon],
            name: translatedName,
        },
        category: {
            id: getCategory(weapon),
            name: $t(getCategory(weapon)),
        },
        pattern: {
            id: pattern,
            // Some names are numbers, let's convert them to strings.
            // https://github.com/ByMykel/CSGO-API/issues/158
            name: $t(paintKits[pattern]?.description_tag)?.toString(),
        },
        min_float: paintKits[pattern]?.wear_remap_min,
        max_float: paintKits[pattern]?.wear_remap_max,
        rarity: {
            id: rarity,
            name: $t(rarity),
            color: getRarityColor(rarity),
        },
        stattrak: isStatTrak,
        souvenir: souvenirSkins?.[`skin-${item.object_id}`] ?? false,
        paint_index: paintKits[pattern]?.paint_index,
        wears: getWears(
            paintKits[pattern]?.wear_remap_min,
            paintKits[pattern]?.wear_remap_max
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
        legacy_model: paintKits[pattern]?.legacy_model,
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
                weapon_id: weaponIDMapping[knife.name],
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
            legacy_model: true,
            image: getImageUrl(`econ/weapons/base_weapons/${knife.name}`),
        })),
    ].filter((skin) => !skin.name.includes("null") && skin.rarity.id);

    saveDataJson(`./public/api/${folder}/skins.json`, skins);
};
