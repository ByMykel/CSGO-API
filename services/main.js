import * as VDF from "vdf-parser";
import axios from "axios";
import { ITEMS_GAME_URL } from "../constants.js";

export const state = {
    itemsGame: null,
    prefabs: null,
    items: null,
    itemsById: null,
    itemSets: null,
    stickerKits: null,
    paintKits: null,
    paintKitsRarity: null,
    musicDefinitions: null,
    clientLootLists: null,
    revolvingLootLists: null,
};

export const parseObjectValues = (items) => {
    const result = [];

    for (const values of Object.values(items)) {
        for (const value of Object.values(values)) {
            result.push(value);
        }
    }

    return Object.values(result);
};

export const parseObjectEntries = (items) => {
    const result = [];

    for (const values of Object.values(items)) {
        for (const [key, value] of Object.entries(values)) {
            result[key] = value;
        }
    }

    return Object.entries(result);
};

export const loadItemsGame = async () => {
    await axios
        .get(ITEMS_GAME_URL)
        .then((response) => {
            return VDF.parse(response.data).items_game;
        })
        .then((data) => {
            state.itemsGame = data;
        })
        .catch((error) => {
            throw new Error(`Error loading items_game.txt from ${ITEMS_GAME_URL}`);
        });
};

export const loadItemSets = () => {
    state.itemSets = parseObjectValues(state.itemsGame.item_sets);
};

export const loadStickerKits = () => {
    state.stickerKits = parseObjectEntries(state.itemsGame.sticker_kits).map(
        ([key, item]) => {
            return {
                ...item,
                object_id: key,
            };
        }
    );
};

export const loadItems = () => {
    state.items = parseObjectEntries(state.itemsGame.items).reduce(
        (acc, [key, item]) => {
            acc[item.name] = {
                ...item,
                object_id: key,
                item_name: item.item_name,
                item_description: item.item_description,
                item_name_prefab: state.prefabs[item.prefab]?.item_name,
                item_description_prefab:
                    state.prefabs[item.prefab]?.item_description,
            };
            return acc;
        },
        {}
    );
};

export const loadItemsById = () => {
    state.itemsById = parseObjectEntries(state.itemsGame.items).reduce(
        (acc, [key, item]) => {
            acc[key] = {
                ...item,
                object_id: key,
                item_name: item.item_name,
                item_description: item.item_description,
                item_name_prefab: state.prefabs[item.prefab]?.item_name,
                item_description_prefab:
                    state.prefabs[item.prefab]?.item_description,
            };
            return acc;
        },
        {}
    );
};

export const loadPrefabs = () => {
    state.prefabs = parseObjectEntries(state.itemsGame.prefabs).reduce(
        (acc, [key, prefab]) => {
            acc[key] = {
                item_name: prefab.item_name,
                item_description: prefab.item_description,
                first_sale_date: prefab.first_sale_date ?? null,
            };
            return acc;
        },
        {}
    );
};

export const loadPaintKitsRarity = () => {
    state.paintKitsRarity = parseObjectEntries(
        state.itemsGame.paint_kits_rarity
    ).reduce((acc, [pattern, rarity]) => {
        acc[pattern.toLocaleLowerCase()] = rarity;
        return acc;
    }, {});
};

export const loadPaintKits = () => {
    state.paintKits = parseObjectValues(state.itemsGame.paint_kits).reduce(
        (acc, item) => {
            if (item.description_tag !== undefined) {
                acc[item.name.toLowerCase()] = {
                    description_tag: item.description_tag,
                    wear_remap_min: item.wear_remap_min ?? 0.06,
                    wear_remap_max: item.wear_remap_max ?? 0.8,
                };
            }
            return acc;
        },
        {}
    );
};

export const loadMusicDefinitions = () => {
    const results = [];

    parseObjectEntries(state.itemsGame.music_definitions).forEach(
        ([key, item]) => {
            if (
                item.name !== "valve_csgo_01" &&
                item.name !== "valve_csgo_02"
            ) {
                results.push({
                    ...item,
                    object_id: key,
                    loc_name: item.loc_name,
                    loc_description: item.loc_description,
                    coupon_name: `coupon_${item.name}`,
                });
            }
        }
    );

    state.musicDefinitions = results;
};

export const loadClientLootLists = () => {
    state.clientLootLists = state.itemsGame.client_loot_lists.reduce(
        (acc, item) => {
            return {
                ...acc,
                ...item,
            }
        },
        {}
    );
}

export const loadRevolvingLootLists = () => {
    state.revolvingLootLists = state.itemsGame.revolving_loot_lists.reduce(
        (acc, item) => {
            return {
                ...acc,
                ...item,
            }
        },
        {}
    );
}

export const loadData = async () => {
    await loadItemsGame();
    loadPrefabs();
    loadItems();
    loadItemsById();
    loadItemSets();
    loadStickerKits();
    loadPaintKits();
    loadPaintKitsRarity();
    loadMusicDefinitions();
    loadClientLootLists();
    loadRevolvingLootLists();
};
