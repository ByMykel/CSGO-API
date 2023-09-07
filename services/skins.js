import {
    getWeaponName,
    isNotWeapon,
    knives,
    getCategory,
    getWears,
    getDopplerPhase,
} from "../utils/weapon.js";
import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };

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
    const {
        rarities,
        paintKits,
        cratesBySkins,
        souvenirSkins,
        collectionsBySkins,
    } = state;
    const [weapon, pattern] = getSkinInfo(item.icon_path);
    const image = cdn[`${item.icon_path.toLowerCase()}_large`];
    const translatedName = !isNotWeapon(weapon)
        ? $t(items[weapon].item_name_prefab)
        : $t(items[weapon].item_name);
    const translatedDescription = !isNotWeapon(weapon)
        ? $t(items[weapon].item_description_prefab)
        : $t(items[weapon].item_description);

    const isStatTrak =
        weapon.includes("knife") ||
        weapon.includes("bayonet") ||
        state.stattTrakSkins[pattern] !== undefined;

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

    return {
        id: `skin-${item.object_id}`,
        name: isNotWeapon(weapon)
            ? $tc("rare_special", {
                  item_name: translatedName,
                  pattern: $t(paintKits[pattern].description_tag),
              })
            : `${translatedName} | ${$t(paintKits[pattern].description_tag)}`,
        name_original: items[weapon].name,
        description: translatedDescription,
        weapon: translatedName,
        category: $t(getCategory(weapon)),
        pattern: $t(paintKits[pattern].description_tag),
        min_float: paintKits[pattern].wear_remap_min,
        max_float: paintKits[pattern].wear_remap_max,
        rarity: $t(rarity),
        rarity_original: rarity,
        stattrak: isStatTrak,
        souvenir: souvenirSkins?.[`skin-${item.object_id}`] ?? false,
        paint_index: paintKits[pattern].paint_index,
        wears: getWears(
            paintKits[pattern].wear_remap_min,
            paintKits[pattern].wear_remap_max
        ).map(wearKey => $t(wearKey)),
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
            name_original: knife.name,
            description: $t(knife.item_description),
            weapon: $t(`sfui_wpnhud_${knife.name.replace("weapon_", "")}`),
            category: $t("sfui_invpanel_filter_melee"),
            pattern: null,
            min_float: null,
            max_float: null,
            rarity: $t(`rarity_ancient_weapon`),
            rarity_original: 'rarity_ancient_weapon',
            stattrak: true,
            paint_index: null,
            crates:
                cratesBySkins[`skin-vanilla-${knife.name}`]?.map((i) => ({
                    ...i,
                    name: $t(i.name),
                })) ?? [],
            image: cdn[`econ/weapons/base_weapons/${knife.name}`],
        })),
    ];

    saveDataJson(`./public/api/${folder}/skins.json`, skins);
};
