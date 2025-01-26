import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isCollection = (item) => item.is_collection !== undefined;

const isSelfOpeningCollection = (item) => {
    if (item.item_name === undefined) return false;

    if (!item.item_name.startsWith("#CSGO_crate")) {
        return false;
    }

    if (item.item_name.includes("#CSGO_crate_tool_stattrak_swap")) {
        return false;
    }

    if (item.prefab?.includes("weapon_case_key")) {
        return false;
    }

    // Can't really find a way to filter collections
    // if (item.item_type === undefined) {
    //     if (item.translation_name.includes("Collection")) {
    //         return true;
    //     }
    // }

    if (item.item_type === "self_opening_purchase") {
        if (item.prefab.includes("graffiti")) {
            return true;
        }
    }

    return false;
};

const parseItem = (item) => {
    const { skinsByCollections, cratesByCollections } = state;

    const fileName = `${item.name.replace("#CSGO_", "")}`;
    const image = getImageUrl(`econ/set_icons/${fileName}`);

    return {
        id: `collection-${item.name.replace("#CSGO_", "").replace(/_/g, "-")}`,
        name: item.name_force ? $t(item.name_force) : $t(item.name),
        crates: (
            cratesByCollections?.[item.name.replace("#CSGO_", "")] ?? []
        ).map((i) => ({
            ...i,
            name: $t(i.name),
        })),
        contains: skinsByCollections?.[item.name.replace("#CSGO_", "")].map(
            (i) => ({
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
            })
        ),
        image,
    };
};

const parseItemSelfOpening = (item) => {
    const { skinsByCollections } = state;

    const image = getImageUrl(item.image_inventory.toLowerCase());

    return {
        id: `collection-${item.object_id}`,
        name: $t(item.item_name),
        crates: [],
        contains: (skinsByCollections?.[item.name] ?? []).map((i) => ({
            ...i,
            name: $t(i.name),
            rarity: {
                id: i.rarity,
                name: $t(i.rarity),
                color: getRarityColor(i.rarity),
            },
        })),
        image,
    };
};

export const getCollections = () => {
    const { items, itemSets } = state;
    const { folder } = languageData;

    const collections = [
        ...itemSets.filter(isCollection).map(parseItem),
        ...Object.values(items)
            .filter(isSelfOpeningCollection)
            .map(parseItemSelfOpening),
    ].filter((collection) => collection.name);

    saveDataJson(`./public/api/${folder}/collections.json`, collections);
};
