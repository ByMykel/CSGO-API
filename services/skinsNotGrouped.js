import {
    getWeaponName,
    isNotWeapon,
    knives,
    getWears,
    getDopplerPhase,
    skinMarketHashName,
    getCategory,
    getRarityColor,
    formatSkinImage,
    getFinishStyleLink,
    weaponIDMapping
} from "../utils/index.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };
import { $t, $tc, $tTag, languageData } from "./translations.js";
import { state } from "./main.js";
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

const getDescription = (desc, paintKits, pattern, isStatTrak) => {
    const stattrakText = isStatTrak ? `<span style='color:#99ccff;'>${$t("attrib_killeater")}</span><br/><br/><span style='color:#cf6a32;'>${$t("killeaterdescriptionnotice_kills")}</span><br/><br/> ` : "";

    const pattern_desc = $t(`#PaintKit_${pattern}`);
    if (pattern_desc && pattern_desc.length > 0) {
        return `${stattrakText}${desc} ${pattern_desc}`;
    }

    const tag = paintKits[pattern].description_tag
        .toLowerCase()
        .replace("_tag", "");
    const tag_desc = $t(tag);
    if (tag_desc && tag_desc.length > 0) {
        return `${stattrakText}${desc} ${tag_desc}`;
    }

    const idx_desc = $tTag(paintKits[pattern].description_tag);
    if (idx_desc && idx_desc.length > 0) {
        return `${stattrakText}${desc} ${idx_desc}`;
    }

    return desc;
};

const getVanillaDescription = (desc, isStatTrak) => {
    const stattrakText = isStatTrak ? `<span style='color:#99ccff;'>${$t("attrib_killeater")}</span><br/><br/><span style='color:#cf6a32;'>${$t("killeaterdescriptionnotice_kills")}</span><br/><br/> ` : "";

    return `${stattrakText}${desc}`;
};

const parseItem = (item, items) => {
    const {
        rarities,
        paintKits,
        souvenirSkins,
        stattTrakSkins,
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
        stattTrakSkins[`[${pattern}]${weapon}`] !== undefined;
    const isSouvenir = souvenirSkins?.[`skin-${item.object_id}`] ?? false;

    const isKnife =
        weapon.includes("weapon_knife") || weapon.includes("weapon_bayonet");

    const dopplerPhase = getDopplerPhase(paintKits[pattern]?.paint_index);

    const rarity = !isNotWeapon(weapon)
        ? (rarities[`[${pattern}]${weapon}`]?.rarity ? (`rarity_${rarities[`[${pattern}]${weapon}`]?.rarity}_weapon`) : null)
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
        paintKits[pattern]?.wear_remap_min,
        paintKits[pattern]?.wear_remap_max
    );

    const team =
        !items[weapon].used_by_classes ||
            Object.keys(items[weapon].used_by_classes).length === 2
            ? "both"
            : Object.keys(items[weapon].used_by_classes)[0];

    return types.map((type) =>
        wears.map((wear, index) => ({
            id: `skin-${item.object_id}_${index}${type === "skin_stattrak"
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
                        pattern: $t(paintKits[pattern]?.description_tag),
                        wear: $t(wear),
                    }
                )
                : $tc(type, {
                    item_name: translatedName,
                    pattern: $t(paintKits[pattern]?.description_tag),
                    wear: $t(wear),
                }),
            description: getDescription(
                translatedDescription,
                paintKits,
                pattern,
                type === "skin_stattrak",
            ),
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
            wear: {
                id: wear,
                name: $t(wear),
            },
            stattrak: type === "skin_stattrak",
            souvenir: type === "skin_souvenir",
            paint_index: paintKits[pattern]?.paint_index,
            rarity: {
                id: rarity,
                name: $t(rarity),
                color: getRarityColor(rarity),
            },
            ...(dopplerPhase && { phase: dopplerPhase }),
            // Comment this because it makes JSON file too big.
            // collections:
            //     collectionsBySkins?.[`skin-${item.object_id}`]?.map((i) => ({
            //         ...i,
            //         name: $t(i.name),
            //     })) ?? [],
            // crates:
            //     cratesBySkins?.[`skin-${item.object_id}`]?.map((i) => ({
            //         ...i,
            //         name: $t(i.name),
            //     })) ?? [],
            market_hash_name: skinMarketHashName({
                itemName: !isNotWeapon(weapon)
                    ? $t(items[weapon].item_name_prefab, true)
                    : $t(items[weapon].item_name, true),
                pattern: $t(paintKits[pattern]?.description_tag, true),
                wear: $t(wear, true),
                isStatTrak: type === "skin_stattrak",
                isSouvenir: type === "skin_souvenir",
                isWeapon: !isNotWeapon(weapon),
                isVanilla: false,
            }),
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
            style: {
                id: paintKits[pattern]?.style_id,
                name: $t(paintKits[pattern]?.style_name),
                url: getFinishStyleLink(paintKits[pattern]?.style_id)
            },
            legacy_model: paintKits[pattern]?.legacy_model,
            image: formatSkinImage(image, wear),
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
                    skin_id: `skin-vanilla-${knife.name}`,
                    name: $tc(type, {
                        item_name: $t(knife.item_name),
                    }),
                    description: getVanillaDescription($t(knife.item_description), type === "rare_special_vanilla_stattrak"),
                    weapon: {
                        id: knife.item_name,
                        weapon_id: weaponIDMapping[knife.name],
                        name: $t(knife.item_name),
                    },
                    category: {
                        id: "sfui_invpanel_filter_melee",
                        name: $t("sfui_invpanel_filter_melee"),
                    },
                    rarity: {
                        id: `rarity_ancient_weapon`,
                        name: $t(`rarity_ancient_weapon`),
                        color: getRarityColor(`rarity_ancient_weapon`),
                    },
                    stattrak: type === "rare_special_vanilla_stattrak",
                    market_hash_name: skinMarketHashName({
                        itemName: $t(knife.item_name, true),
                        pattern: null,
                        wear: null,
                        isStatTrak: type === "rare_special_vanilla_stattrak",
                        isSouvenir: false,
                        isWeapon: false,
                        isVanilla: true,
                    }),
                    team: {
                        id: "both",
                        name: $t("inv_filter_both_teams"),
                    },
                    style: {
                        id: 0,
                        name: $t(`SFUI_ItemInfo_FinishStyle_0`),
                        url: getFinishStyleLink(0)
                    },
                    legacy_model: true,
                    image: getImageUrl(
                        `econ/weapons/base_weapons/${knife.name}`
                    ),
                }))
            )
            .flatMap((level1) => level1),
    ].filter((skin) => !skin.name.includes("null") && skin.rarity.id);

    saveDataJson(`./public/api/${folder}/skins_not_grouped.json`, skins);
};
