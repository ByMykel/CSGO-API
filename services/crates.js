import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";
import specialNotes from "../utils/specialNotes.json" with { type: "json" };
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isCrate = item => {
    if (item.item_name === undefined) return false;

    if (item?.attributes?.["set supply crate series"]?.attribute_class === "supply_crate_series") {
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

const getCrateType = item => {
    if (item.prefab === "weapon_case") {
        return "Case";
    }

    if (item.prefab === "weapon_case_souvenirpkg" || item.prefab.includes("souvenir_crate")) {
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

const getMarketHashName = item => {
    if (["4600", "4614", "4719", "4729", "4779", "4871", "4872", "4783", "4795"].includes(item.object_id)) {
        return null;
    }

    return $t(item.item_name, true).replace("Holo/Foil", "Holo-Foil");
};

const parseItem = (item, prefabs) => {
    const { skinsByCrates, revolvingLootLists, cdnImages } = state;

    const image =
        cdnImages[item.image_inventory.toLowerCase()] ?? getImageUrl(item.image_inventory.toLowerCase());
    const lootListName = item?.loot_list_name ?? null;
    const attributeValue = item.attributes?.["set supply crate series"]?.value ?? null;
    const keyLootList = lootListName ?? revolvingLootLists[attributeValue] ?? null;

    let crate = {
        id: `crate-${item.object_id}`,
        name: $t(item.item_name),
        description: $t(item.item_description) ?? $t(item.item_description_prefab),
        def_index: item.object_id,
        type: getCrateType(item),
        first_sale_date: getFirstSaleDate(item, prefabs),
        rarity: {
            id: "rarity_common",
            name: $t("rarity_common"),
            color: getRarityColor("rarity_common"),
        },
        contains: (skinsByCrates?.[item.tags?.ItemSet?.tag_value] ?? skinsByCrates?.[keyLootList] ?? []).map(
            i => ({
                ...i,
                name: i.name instanceof Object ? `${$t(i.name.weapon)} | ${$t(i.name.pattern)}` : $t(i.name),
                rarity: {
                    id: i.rarity,
                    name: $t(i.rarity),
                    color: getRarityColor(i.rarity),
                },
            })
        ),
        contains_rare: (skinsByCrates?.[`rare--${keyLootList}`] ?? []).map(i => ({
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
        })),
        special_notes: specialNotes?.[`crate-${item.object_id}`],
        market_hash_name: getMarketHashName(item),
        rental: !!item.attributes["can open for rental"],
        image,
        model_player: item.model_player ?? null,
        loot_list: item.loot_list_rare_item_name
            ? {
                  name: $t(item.loot_list_rare_item_name),
                  footer: $t(item.loot_list_rare_item_footer),
                  // The crates without image_unusual_item are the ones with gloves, this might not work in the future
                  image: item.image_unusual_item
                      ? getImageUrl(item.image_unusual_item)
                      : getImageUrl("econ/weapon_cases/default_rare_item"),
              }
            : null,

        // Return original attributes from item_game.json
        original: {
            item_name: item.item_name,
            image_inventory: item.image_inventory.toLowerCase(),
        },
    };

    // Souvenir Highlight Package
    if ($t(`${item.item_name}^highlight`)) {
        return [
            crate,
            {
                ...crate,
                id: `crate-${item.object_id}_highlight`,
                name: $t(`${item.item_name}^highlight`),
                rarity: {
                    id: "rarity_common_highlight",
                    name: `${$t("highlight")} ${$t("rarity_common")}`,
                    color: "#ffd7aa", // Highlight Base Grade Container
                },
                type: "Souvenir Highlight",
                market_hash_name: $t(`${item.item_name}^highlight`, true),
            },
        ];
    }

    return crate;
};

export const getCrates = async () => {
    const { items, prefabs } = state;
    const { folder } = languageData;

    const crates = Object.values(items)
        .filter(isCrate)
        .map(item => parseItem(item, prefabs))
        .flat()
        .filter(crate => crate.name);

    await saveDataJson(`./public/api/${folder}/crates.json`, crates);
};
