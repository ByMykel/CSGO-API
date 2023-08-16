import * as VDF from "vdf-parser";
import axios from "axios";
import { ITEMS_GAME_URL } from "../constants.js";
import { isExclusive, isNotWeapon, knives } from "../utils/weapon.js";
import { rareSpecial } from "../utils/rareSpecial.js";

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
    skinsByCrates: null,
    skinsByCratesSpecial: null,
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
            throw new Error(
                `Error loading items_game.txt from ${ITEMS_GAME_URL}`
            );
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
    state.paintKits = parseObjectEntries(state.itemsGame.paint_kits).reduce(
        (acc, [key, item]) => {
            if (item.description_tag !== undefined) {
                acc[item.name.toLowerCase()] = {
                    description_tag: item.description_tag,
                    wear_remap_min: item.wear_remap_min ?? 0.06,
                    wear_remap_max: item.wear_remap_max ?? 0.8,
                    paint_index: key,
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
            };
        },
        {}
    );
};

export const loadRevolvingLootLists = () => {
    state.revolvingLootLists = state.itemsGame.revolving_loot_lists.reduce(
        (acc, item) => {
            return {
                ...acc,
                ...item,
            };
        },
        {}
    );
};

export const loadRarities = () => {
    const hardCoded = {
        "[cu_m4a1_howling]weapon_m4a1": {
            rarity: "contraband",
        },
        "[cu_retribution]weapon_elite": {
            rarity: "rare",
        },
        "[cu_mac10_decay]weapon_mac10": {
            rarity: "mythical",
        },
        "[cu_p90_scorpius]weapon_p90": {
            rarity: "rare",
        },
        "[hy_labrat_mp5]weapon_mp5sd": {
            rarity: "mythical",
        },
        "[cu_xray_p250]weapon_p250": {
            rarity: "mythical",
        },
        "[cu_usp_spitfire]weapon_usp_silencer": {
            rarity: "legendary",
        },
        "[am_nitrogen]weapon_cz75a": {
            rarity: "rare",
        },
    };

    const rarities = [
        "common",
        "uncommon",
        "rare",
        "mythical",
        "legendary",
        "ancient",
    ];

    const lootList = Object.entries(
        state.itemsGame.client_loot_lists.reduce((acc, item) => {
            return {
                ...acc,
                ...item,
            };
        }, {})
    );

    const items = {};

    lootList.forEach(([name, keys]) => {
        const rarity = name.split("_").pop();
        if (!rarities.includes(rarity)) return;

        Object.keys(keys).forEach((key) => {
            if (!key.includes("[")) return;

            items[key.toLocaleLowerCase()] = {
                rarity: rarity,
            };
        });
    });

    Object.assign(items, hardCoded);

    state.rarities = items;
};

export const loadSkinsByCrates = () => {
    const { clientLootLists, revolvingLootLists } = state;

    const getItems = (key) => {
        const value = clientLootLists[key];

        if (value == null) return;

        let keyys = Object.keys(value).filter((item) => {
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

        if (keyys[0].includes("[") && keyys[0].includes("]")) {
            return keyys;
        }

        if (keyys[0].includes("Commodity Pin")) {
            return keyys;
        }

        return keyys.map(getItems);
    };

    state.skinsByCrates = {
        ...Object.values(revolvingLootLists).reduce((items, item) => {
            items[item] = Object.keys(clientLootLists?.[item] ?? {})
                .map((key) => {
                    if (key.includes("[") && key.includes("]")) {
                        return key;
                    }

                    if (key.includes("Commodity Pin")) {
                        return key;
                    }

                    return getItems(key);
                })
                .flatMap((s) => s)
                .filter((i) => i != null)
                .reduce((acc, item) => {
                    if (Array.isArray(item)) {
                        return acc.concat(item);
                    }
                    acc.push(item);
                    return acc;
                }, [])
                .map(getItemFromKey);

            return items;
        }, {}),
        ...Object.entries(Object.assign({}, ...state.itemsGame.item_sets))
            .filter((i) => {
                return ["set_xraymachine"].includes(i[0]);
            })
            .reduce((items, [key, value]) => {
                items[key] = Object.keys(value.items).map(getItemFromKey);
                return items;
            }, {}),
    };
};

export const loadSkinsByCratesSpecial = () => {
    const { clientLootLists, revolvingLootLists } = state;

    const getItems = (key) => {
        const value = clientLootLists[key];

        if (rareSpecial[key] !== undefined) {
            return Object.keys(rareSpecial[key]).map((key) => key);
        }

        if (value == null) return;

        let keyys = Object.keys(value).filter((item) => {
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

        if (keyys[0].includes("[") && keyys[0].includes("]")) {
            return null;
        }

        if (keyys[0].includes("Commodity Pin")) {
            return null;
        }

        return keyys.map(getItems);
    };

    state.skinsByCratesSpecial = {
        ...Object.values(revolvingLootLists).reduce((items, item) => {
            items[item] = Object.keys(clientLootLists?.[item] ?? {})
                .map((key) => {
                    if (key.includes("[") && key.includes("]")) {
                        return null;
                    }

                    if (key.includes("Commodity Pin")) {
                        return null;
                    }

                    return getItems(key);
                })
                .flatMap((s) => s)
                .filter((i) => i != null)
                .reduce((acc, item) => {
                    if (Array.isArray(item)) {
                        return acc.concat(item);
                    }
                    acc.push(item);
                    return acc;
                }, [])
                .map(getItemFromKey);

            return items;
        }, {}),
    };
};

export const loadyCratesBySkins = () => {
    const {
        revolvingLootLists,
        skinsByCrates,
        skinsByCratesSpecial,
        items: items2,
    } = state;

    state.cratesBySkins = {
        ...Object.entries(skinsByCrates).reduce((acc, [crate, items]) => {
            items.forEach((item) => {
                if (!(item.id in acc)) {
                    acc[item.id] = [];
                }

                const lootList = Object.entries(revolvingLootLists).find(
                    ([id, item]) => item === crate
                );
                const crateItem =
                    Object.values(items2).find(
                        (i) =>
                            i?.loot_list_name == lootList?.[1] ||
                            i.attributes?.["set supply crate series"]?.value ==
                                lootList?.[0]
                    ) ?? null;

                if (crateItem != null) {
                    acc[item.id].push({
                        id: `crate-${crateItem.object_id}`,
                        name: crateItem.item_name,
                    });
                }
            });

            return acc;
        }),
        ...Object.entries(skinsByCratesSpecial).reduce(
            (acc, [crate, items]) => {
                items.forEach((item) => {
                    if (!(item.id in acc)) {
                        acc[item.id] = [];
                    }

                    const lootList = Object.entries(revolvingLootLists).find(
                        ([id, item]) => item === crate
                    );
                    const crateItem =
                        Object.values(items2).find(
                            (i) =>
                                i?.loot_list_name == lootList?.[1] ||
                                i.attributes?.["set supply crate series"]
                                    ?.value == lootList?.[0]
                        ) ?? null;

                    if (crateItem != null) {
                        acc[item.id].push({
                            id: `crate-${crateItem.object_id}`,
                            name: crateItem.item_name,
                        });
                    }
                });

                return acc;
            }
        ),
    };
};

const getItemFromKey = (key) => {
    const {
        stickerKits,
        musicDefinitions,
        items,
        paintKits,
        itemsGame,
        rarities,
    } = state;

    if (key.includes("Commodity Pin")) {
        const pin = items[key];

        return {
            id: `collection-${pin.object_id}`,
            name: pin.item_name,
            rarity: `rarity_${pin.item_rarity}`,
        };
    }

    const regex = /\[(?<name>.+?)\](?<type>.+)/;
    const match = key.match(regex);
    const { name, type } = match.groups;

    switch (type) {
        case "sticker":
            const sticker = stickerKits.find((item) => item.name === name);
            return {
                id: `sticker-${sticker.object_id}`,
                name: sticker.item_name,
                rarity: `rarity_${sticker.item_rarity}`,
            };
        case "patch":
            const patch = stickerKits.find((item) => item.name === name);
            return {
                id: `patch-${patch.object_id}`,
                name: patch.item_name,
                rarity: `rarity_${patch.item_rarity}`,
            };
        case "musickit":
            const kit = musicDefinitions.find((item) => item.name === name);
            const exclusive = isExclusive(kit.name);
            return {
                id: `music_kit-${kit.object_id}`,
                name: exclusive ? kit.loc_name : kit.coupon_name,
                // TODO: rarity should be translated
                rarity: "rarity_rare",
            };
        case "spray":
            const spray = stickerKits.find((item) => item.name === name);
            return {
                id: `graffiti-${spray.object_id}`,
                name: spray.item_name,
                rarity: `rarity_${spray.item_rarity}`,
            };
        // The rest are skins
        default:
            let id = "";
            let itemName = "";
            const translatedName =
                items[type]?.item_name ?? items[type].item_name_prefab;

            const isKnife =
                type.includes("weapon_knife") ||
                type.includes("weapon_bayonet");

            const rarity = !isNotWeapon(type)
                ? `rarity_${rarities[key.toLocaleLowerCase()].rarity}_weapon`
                : isKnife
                ? // Knives are 'Covert'
                  `rarity_ancient_weapon`
                : // Gloves are 'Extraordinary'
                  `rarity_ancient`;

            // Not the best way to add vanilla knives.
            if (name === "vanilla") {
                id = `skin-vanilla-${type}`;
                itemName = {
                    tKey: "rare_special_vanilla",
                    weapon: knives.find((k) => k.name == type).item_name,
                };
            } else {
                const weaponIcons = Object.entries(
                    itemsGame.alternate_icons2.weapon_icons
                ).find(
                    ([, value]) =>
                        value.icon_path.includes(name) &&
                        value.icon_path.includes(type)
                );

                id = `skin-${weaponIcons[0]}`;
                itemName = {
                    ...(isNotWeapon(type) && { tKey: "rare_special" }),
                    weapon: translatedName.replace("#", ""),
                    pattern: paintKits[
                        name.toLowerCase()
                    ].description_tag.replace("#", ""),
                };
            }

            return {
                id,
                name: itemName,
                rarity,
            };
    }
};

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
    loadRarities();
    loadSkinsByCrates();
    loadSkinsByCratesSpecial();
    loadyCratesBySkins();
};
