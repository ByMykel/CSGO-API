import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, language } from "./translations.js";
import { state } from "./main.js";

const isCrate = (item) => {
    if (item.item_name === undefined) return false;

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

const parseItem = (item, itemsById, prefabs) => {
    const image = `${IMAGES_BASE_URL}${item.image_inventory.toLowerCase()}.png`;

    return {
        id: `crate-${item.object_id}`,
        // collection_id: item.tags?.ItemSet?.tag_value ?? null,
        name: $translate(item.item_name) ?? $translate(item_name_prefab),
        description:
            $translate(item.item_description) ??
            $translate(item.item_description_prefab),
        type: getCrateType(item),
        first_sale_date: getFirstSaleDate(item, itemsById, prefabs),
        image,
    };
};

export const getCrates = () => {
    const { items, itemsById, prefabs } = state;
    const crates = [];

    Object.values(items).forEach((item) => {
        if (isCrate(item)) crates.push(parseItem(item, itemsById, prefabs));
    });

    saveDataJson(`./public/api/${language}/crates.json`, crates);

    const cratesByTypes = groupByType(crates);

    Object.entries(cratesByTypes).forEach(([type, values]) => {
        saveDataJson(
            `./public/api/${language}/crates/${getFileNameByType(type)}`,
            values
        );
    });
};
