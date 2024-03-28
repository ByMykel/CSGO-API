import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

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

const getFirstSaleDate = (item, prefabs) => {
    if (item.first_sale_date !== undefined) {
        return item.first_sale_date;
    }

    if (item.associated_items !== undefined) {
        const id = Object.keys(item.associated_items)[0];

        return state.itemsGame.items[id]?.first_sale_date;
    }

    if (item.prefab !== undefined) {
        return prefabs[item.prefab]?.first_sale_date ?? null;
    }

    return null;
};

const parseItem = (item, prefabs) => {
    const { skinsByCrates, revolvingLootLists } = state;

    const image = getImageUrl(item.image_inventory.toLowerCase());
    const lootListName = item?.loot_list_name ?? null;
    const attributeValue =
        item.attributes?.["set supply crate series"]?.value ?? null;
    const keyLootList =
        lootListName ?? revolvingLootLists[attributeValue] ?? null;

    return {
        id: `crate-${item.object_id}`,
        name: $t(item.item_name),
        description:
            $t(item.item_description) ?? $t(item.item_description_prefab),
        type: getCrateType(item),
        first_sale_date: getFirstSaleDate(item, prefabs),
        contains: (
            skinsByCrates?.[item.tags?.ItemSet?.tag_value] ??
            skinsByCrates?.[keyLootList] ??
            []
        ).map((i) => ({
            ...i,
            name:
                i.name instanceof Object
                    ? `${$t(i.name.weapon)} | ${$t(i.name.pattern)}`
                    : $t(i.name),
            rarity: {
                id: i.rarity,
                name: $t(i.rarity),
                color: getRarityColor(i.rarity),
            },
        })),
        contains_rare: (skinsByCrates?.[`rare--${keyLootList}`] ?? []).map(
            (i) => ({
                ...i,
                name: $tc(i.name?.tKey ?? JSON.stringify(i.name), {
                    item_name: $t(i.name.weapon),
                    pattern: $t(i.name.pattern),
                }),
                rarity: {
                    id: i.rarity,
                    name: $t(i.rarity),
                    color: getRarityColor(i.rarity),
                },
            })
        ),
        special_notes: specialNotes?.[`crate-${item.object_id}`],
        market_hash_name: $t(item.item_name, true),
        image,
    };
};

export const getCrates = () => {
    const { items, prefabs } = state;
    const { folder } = languageData;

    const crates = Object.values(items)
        .filter(isCrate)
        .map((item) => parseItem(item, prefabs))
        .filter((crate) => crate.name);

    saveDataJson(`./public/api/${folder}/crates.json`, crates);

    const cratesByTypes = groupByType(crates);

    Object.entries(cratesByTypes).forEach(([type, values]) => {
        saveDataJson(
            `./public/api/${folder}/crates/${getFileNameByType(type)}`,
            values
        );
    });
};
