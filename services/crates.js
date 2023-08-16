import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "../utils/saveDataMemory.js";
import { rareSpecial } from "../utils/rareSpecial.js";
import { isNotWeapon, knives } from "../utils/weapon.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

const isCrate = (item) => {
    if (item.item_name === undefined) return false;

    if (
        item?.attributes?.["set supply crate series"]?.attribute_class ===
        "supply_crate_series"
    ) {
        return true;
    }

    if (item.item_name.startsWith("#CSGO_storageunit")) {
        return true;
    }

    if (!item.item_name.startsWith("#CSGO_crate")) {
        return false;
    }

    if (item.item_name.includes("#CSGO_crate_tool_stattrak_swap")) {
        return false;
    }

    if (item.prefab?.includes("weapon_case_key")) {
        return false;
    }

    if (item.item_type === "self_opening_purchase") {
        return false;
    }

    // Can't really find a way to filter collections
    // if (item.translation_name.includes("Collection")) {
    //     return false;
    // }

    return true;
};

const getFileNameByType = (type) => {
    const files = {
        other: "other.json",
        Case: "cases.json",
        Souvenir: "souvenir.json",
        "Sticker Capsule": "capsules/stickers.json",
        "Autograph Capsule": "capsules/autographs.json",
        "Patch Capsule": "capsules/patches.json",
        Pins: "capsules/pins.json",
        "Music Kit Box": "music_kit_boxes.json",
        Graffiti: "graffiti.json",
    };

    return files[type] ?? "other.json";
};

const getCrateType = (item) => {
    if (item.prefab === "weapon_case") {
        return "Case";
    }

    if (item.prefab === "weapon_case_souvenirpkg") {
        return "Souvenir";
    }

    if (item.item_name.startsWith("#CSGO_storageunit")) {
        return null;
    }

    if (item.prefab.includes("sticker_capsule")) {
        return "Sticker Capsule";
    }

    if (item.prefab === "graffiti_box") {
        return "Graffiti";
    }

    if (item.name.startsWith("crate_pins")) {
        return "Pins";
    }

    // if (item.translation_description?.includes("capsule")) {
    //     return "Sticker Capsule";
    // }

    if (item.name.startsWith("crate_signature")) {
        return "Autograph Capsule";
    }

    if (item.image_inventory.includes("patch")) {
        return "Patch Capsule";
    }

    if (item.name.startsWith("crate_musickit")) {
        return "Music Kit Box";
    }

    if (item?.tags?.StickerCapsule !== undefined) {
        return "Sticker Capsule";
    }

    return null;
};

const groupByType = (crates) => {
    return crates.reduce(
        (items, item) => ({
            ...items,
            [item.type ?? "other"]: [
                ...(items[item.type ?? "other"] || []),
                item,
            ],
        }),
        {}
    );
};

const getFirstSaleDate = (item, itemsById, prefabs) => {
    if (item.first_sale_date !== undefined) {
        return item.first_sale_date;
    }

    if (item.associated_items !== undefined) {
        const id = Object.keys(item.associated_items)[0];

        return itemsById[id].first_sale_date;
    }

    if (item.prefab !== undefined) {
        return prefabs[item.prefab]?.first_sale_date ?? null;
    }

    return null;
};

const getItemFromKey = (key, parentKey) => {
    const { stickerKits, musicDefinitions, items, paintKits, itemsGame } =
        state;

    const regex = /\[(?<name>.+?)\](?<type>.+)/;
    const match = key.match(regex);

    const { name, type } = match.groups;

    switch (type) {
        case "sticker":
            const sticker = stickerKits.find((item) => item.name === name);
            return {
                id: `sticker-${sticker.object_id}`,
                name: $t(sticker.item_name),
                rarity: $t(`rarity_${sticker.item_rarity}`),
            };
        case "patch":
            const patch = stickerKits.find((item) => item.name === name);
            return {
                id: `patch-${patch.object_id}`,
                name: $t(patch.item_name),
                rarity: $t(`rarity_${patch.item_rarity}`),
            };
        case "musickit":
            const kit = musicDefinitions.find((item) => item.name === name);
            const exclusive = $t(kit.coupon_name) === null;
            return {
                id: `music_kit-${kit.object_id}`,
                name: exclusive ? $t(kit.loc_name) : $t(kit.coupon_name),
                rarity: $t("rarity_rare"),
            };
        case "spray":
            const spray = stickerKits.find((item) => item.name === name);
            return {
                id: `graffiti-${spray.object_id}`,
                name: $t(spray.item_name),
                rarity: $t(`rarity_${spray.item_rarity}`),
            };
        // The rest are skins
        default:
            let id = "";
            let itemName = "";
            const translatedName =
                $t(items[type].item_name) ?? $t(items[type].item_name_prefab);
            const itemRarity = parentKey.split("_").pop();

            // Not the best way to add vanilla knives.
            if (name === "vanilla") {
                id = `skin-vanilla-${type}`;
                itemName = $t(knives.find((k) => k.name == type).item_name);
            } else {
                const weaponIcons = Object.entries(
                    itemsGame.alternate_icons2.weapon_icons
                ).find(
                    ([, value]) =>
                        value.icon_path.includes(name) &&
                        value.icon_path.includes(type)
                );

                id = `skin-${weaponIcons[0]}`;
                itemName = `${translatedName} | ${$t(
                    paintKits[name.toLowerCase()].description_tag
                )}`;
            }

            return {
                id,
                name: itemName,
                rarity: !isNotWeapon(type)
                    ? $t(`rarity_${itemRarity}_weapon`)
                    : type.includes("weapon_knife") ||
                      type.includes("weapon_bayonet")
                    ? $t(`rarity_ancient_weapon`)
                    : $t(`rarity_ancient`),
            };
    }
};

const getContainedItems = (itemName) => {
    const { clientLootLists, items } = state;

    const lootList = clientLootLists[itemName];

    if (lootList === undefined) {
        return [];
    }

    const keyys = Object.keys(lootList).filter((item) => {
        const ignore = [
            "will_produce_stattrak",
            "limit_description_to_number_rnd",
            "contains_stickers_autographed_by_proplayers",
            "contains_stickers_autographed_by_proplayers",
            "contains_stickers_representing_organizations",
            "contains_patches_representing_organizations",
            "all_entries_as_additional_drops",
        ];

        return !ignore.includes(item);
    });

    if (keyys[0].includes("Commodity Pin")) {
        return keyys.map((key) => {
            const pin = items[key];

            return {
                id: `collection-${pin.object_id}`,
                name: $t(pin.item_name),
                rarity: $t(`rarity_${pin.item_rarity}`),
            };
        });
    }

    if (keyys[0].includes("[") && keyys[0].includes("]")) {
        return keyys.map((key) => getItemFromKey(key, itemName));
    }

    return keyys.reduce((items, key) => {
        return [...items, ...getContainedItems(key)];
    }, []);
};

const getContainedRareItems = (itemName) => {
    const { clientLootLists, items } = state;

    const lootList = clientLootLists[itemName];

    if (lootList === undefined) {
        if (rareSpecial[itemName] !== undefined) {
            return Object.keys(rareSpecial[itemName]).map((key) =>
                getItemFromKey(key, itemName)
            );
        }

        return [];
    }

    const keyys = Object.keys(lootList).filter((item) => {
        const ignore = [
            "will_produce_stattrak",
            "limit_description_to_number_rnd",
            "contains_stickers_autographed_by_proplayers",
            "contains_stickers_autographed_by_proplayers",
            "contains_stickers_representing_organizations",
            "contains_patches_representing_organizations",
            "all_entries_as_additional_drops",
        ];

        return !ignore.includes(item);
    });

    if (keyys[0].includes("Commodity Pin")) {
        return [];
    }

    if (keyys[0].includes("[") && keyys[0].includes("]")) {
        return [];
    }

    return keyys.reduce((items, key) => {
        return [...items, ...getContainedRareItems(key)];
    }, []);
};

const parseItem = (item, itemsById, prefabs) => {
    const image = cdn[item.image_inventory.toLowerCase()];

    const { revolvingLootLists } = state;
    const lootListName = item?.loot_list_name ?? null;
    const attributeValue =
        item.attributes?.["set supply crate series"]?.value ?? null;
    const keyLootList =
        lootListName ?? revolvingLootLists[attributeValue] ?? null;

    return {
        id: `crate-${item.object_id}`,
        // collection_id: item.tags?.ItemSet?.tag_value ?? null,
        name: $t(item.item_name) ?? $t(item_name_prefab),
        description:
            $t(item.item_description) ?? $t(item.item_description_prefab),
        type: getCrateType(item),
        first_sale_date: getFirstSaleDate(item, itemsById, prefabs),
        contains: getContainedItems(keyLootList),
        contains_rare: getContainedRareItems(keyLootList),
        image,
    };
};

export const getCrates = () => {
    const { items, itemsById, prefabs } = state;
    const { language, folder } = languageData;

    const crates = Object.values(items)
        .filter(isCrate)
        .map((item) => parseItem(item, itemsById, prefabs));

    saveDataMemory(language, crates);
    saveDataJson(`./public/api/${folder}/crates.json`, crates);

    const cratesByTypes = groupByType(crates);

    Object.entries(cratesByTypes).forEach(([type, values]) => {
        saveDataMemory(language, values);
        saveDataJson(
            `./public/api/${folder}/crates/${getFileNameByType(type)}`,
            values
        );
    });
};
