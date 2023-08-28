import axios from "axios";
import { ITEMS_GAME_URL } from "../constants.js";
import {
    getDopplerPhase,
    isExclusive,
    isNotWeapon,
    knives,
} from "../utils/weapon.js";
import { rareSpecial } from "../utils/rareSpecial.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

export const state = {
    itemsGame: null,
    prefabs: null,
    items: null,
    itemSets: null,
    stickerKits: null,
    stickerKitsObj: null,
    paintKits: null,
    paintKitsRarity: null,
    musicDefinitions: null,
    musicDefinitionsObj: null,
    clientLootLists: null,
    revolvingLootLists: null,
    skinsByCrates: null,
    skinsByCratesSpecial: null,
    souvenirSkins: null,
    stattTrakSkins: null,
};

export const loadItemsGame = async () => {
    await axios
        .get(ITEMS_GAME_URL)
        .then((data) => {
            state.itemsGame = data.data.items_game;
        })
        .catch(() => {
            throw new Error(
                `Error loading items_game.txt from ${ITEMS_GAME_URL}`
            );
        });
};

export const loadItemSets = () => {
    state.itemSets = Object.values(state.itemsGame.item_sets);
};

export const loadStickerKits = () => {
    state.stickerKits = Object.entries(state.itemsGame.sticker_kits).map(
        ([key, item]) => {
            return {
                ...item,
                object_id: key,
            };
        }
    );

    state.stickerKitsObj = Object.fromEntries(
        state.stickerKits.map((item) => [item.name, item])
    );
};

export const loadItems = () => {
    state.items = Object.entries(state.itemsGame.items).reduce(
        (acc, [key, value]) => {
            acc[value.name] = {
                ...value,
                object_id: key,
                item_name: value.item_name,
                item_description: value.item_description,
                item_name_prefab: state.prefabs[value.prefab]?.item_name,
                item_description_prefab:
                    state.prefabs[value.prefab]?.item_description,
            };
            return acc;
        },
        {}
    );
};

export const loadPrefabs = () => {
    state.prefabs = Object.entries(state.itemsGame.prefabs).reduce(
        (acc, [key, value]) => {
            const innerPrefab = state.itemsGame.prefabs[value?.prefab];

            acc[key] = {
                item_name: value.item_name ?? innerPrefab?.item_name,
                item_description:
                    value.item_description ?? innerPrefab?.item_description,
                first_sale_date:
                    value.first_sale_date ??
                    innerPrefab?.first_sale_date ??
                    null,
                prefab: value.prefab ?? innerPrefab?.prefab,
            };
            return acc;
        },
        {}
    );
};

export const loadPaintKits = () => {
    state.paintKits = Object.entries(state.itemsGame.paint_kits).reduce(
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
    state.musicDefinitions = Object.entries(state.itemsGame.music_definitions)
        .filter(
            ([key, item]) =>
                !["valve_csgo_01", "valve_csgo_02"].includes(item.name)
        )
        .map(([key, item]) => ({
            ...item,
            object_id: key,
            loc_name: item.loc_name,
            loc_description: item.loc_description,
            coupon_name: `coupon_${item.name}`,
        }));

    state.musicDefinitionsObj = Object.fromEntries(
        state.musicDefinitions.map((item) => [item.name, item])
    );
};

export const loadClientLootLists = () => {
    state.clientLootLists = state.itemsGame.client_loot_lists;
};

export const loadRevolvingLootLists = () => {
    state.revolvingLootLists = state.itemsGame.revolving_loot_lists;
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

    const rarities = new Set([
        "common",
        "uncommon",
        "rare",
        "mythical",
        "legendary",
        "ancient",
    ]);

    const items = Object.entries(state.itemsGame.client_loot_lists).reduce(
        (acc, [name, keys]) => {
            const rarity = name.split("_").pop();

            if (rarities.has(rarity)) {
                for (const key in keys) {
                    if (key.includes("[")) {
                        acc[key.toLowerCase()] = { rarity: rarity };
                    }
                }
            }

            return acc;
        },
        hardCoded
    );

    state.rarities = items;
};

export const loadSkinsByCrates = () => {
    const { clientLootLists, revolvingLootLists } = state;

    function extractItems(key, lootLists) {
        const currentObject = lootLists[key];
        let items = {};

        for (const subKey in currentObject) {
            // If the key contains "[", it's an item
            if (subKey.includes("[")) {
                items[subKey] = currentObject[subKey];
            }
            // If the key contains 'Commodity Pin', it's a Pin
            if (subKey.includes("Commodity Pin")) {
                items[subKey] = currentObject[subKey];
            }

            // Otherwise, we'll recursively merge the items from the referenced object
            items = { ...items, ...extractItems(subKey, lootLists) };
        }

        return items;
    }

    function extractRareItems(key, lootLists) {
        const currentObject = lootLists[key];

        for (const subKey in currentObject) {
            if (rareSpecial[subKey]) {
                return Object.keys(rareSpecial[subKey]);
            }
        }

        return [];
    }

    state.skinsByCrates = {
        ...Object.values(revolvingLootLists).reduce((items, item) => {
            items[item] = Object.keys(extractItems(item, clientLootLists)).map(
                getItemFromKey
            );

            return items;
        }, {}),

        // To avoid the loop down below
        set_xraymachine: [getItemFromKey("[cu_xray_p250]weapon_p250")],
        // ...Object.entries(state.itemsGame.item_sets)
        //     .filter((i) => {
        //         return !["set_xraymachine"].includes(i[0]);
        //     })
        //     .reduce((items, [key, value]) => {
        //         items[key] = Object.keys(value.items)
        //         // .map(getItemFromKey);
        //         return items;
        //     }, {}),

        // Rare special
        ...Object.values(revolvingLootLists).reduce((items, item) => {
            items[`rare--${item}`] = extractRareItems(
                item,
                clientLootLists
            ).map(getItemFromKey);

            return items;
        }, {}),
    };
};

export const loadyCratesBySkins = () => {
    state.cratesBySkins = {
        ...Object.entries(state.skinsByCrates).reduce(
            (acc, [crateKey, itemsList]) => {
                crateKey = crateKey.replace("rare--", "");

                itemsList.forEach((item) => {
                    if (!(item.id in acc)) {
                        acc[item.id] = [];
                    }

                    const lootList = Object.entries(
                        state.revolvingLootLists
                    ).find(([id, item]) => item === crateKey);

                    const crateItem =
                        state.items[crateKey] ||
                        Object.values(state.items).find(
                            (i) =>
                                i.attributes?.["set supply crate series"]
                                    ?.value == lootList?.[0]
                        );

                    if (crateItem != null) {
                        acc[item.id].push({
                            id: `crate-${crateItem.object_id}`,
                            name: crateItem.item_name,
                        });
                    }
                });

                return acc;
            },
            {}
        ),
    };
};

export const loadSouvenirSkins = () => {
    state.souvenirSkins = Object.values(state.items)
        .filter((item) => {
            return item.prefab === "weapon_case_souvenirpkg";
        })
        .map((item) => {
            const lootListName = item?.loot_list_name ?? null;
            const attributeValue =
                item.attributes?.["set supply crate series"]?.value ?? null;
            const keyLootList =
                lootListName ??
                state.revolvingLootLists[attributeValue] ??
                null;

            return (
                state.skinsByCrates?.[item.tags?.ItemSet?.tag_value] ??
                state.skinsByCrates?.[keyLootList] ??
                []
            );
        })
        .flatMap((level1) => level1)
        .reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
};

export const loadStattrakSkins = () => {
    const { itemSets, items } = state;

    const crates = {};

    Object.values(items).forEach((item) => {
        if (item.prefab === "weapon_case") {
            const name = item?.tags?.ItemSet?.tag_value;

            if (name !== undefined) {
                crates[name] = true;
            }
        }
    });

    const result = {};

    itemSets.forEach((item) => {
        if (item.is_collection) {
            const keys = Object.keys(item.items).map((item) => {
                const pattern = item.match(/\[(.*?)\]/i);

                if (pattern) {
                    return pattern[1];
                }

                return item;
            });

            keys.forEach((key) => {
                if (crates[item.name.replace("#CSGO_", "")] !== undefined) {
                    result[key.toLocaleLowerCase()] = true;
                }
            });
        }
    });

    state.stattTrakSkins = result;
};

const getItemFromKey = (key) => {
    const {
        items,
        itemsGame,
        rarities,
        paintKits,
        stickerKitsObj,
        musicDefinitionsObj,
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
    if (!match) {
        return;
    }
    const { name, type } = match.groups;

    switch (type) {
        case "sticker":
            const sticker = stickerKitsObj[name];
            return {
                id: `${type}-${sticker.object_id}`,
                name: sticker.item_name,
                rarity: `rarity_${sticker.item_rarity}`,
                image: cdn[
                    `econ/stickers/${sticker.sticker_material.toLowerCase()}_large`
                ],
            };
        case "patch":
            const patch = stickerKitsObj[name];
            return {
                id: `${type}-${patch.object_id}`,
                name: patch.item_name,
                rarity: `rarity_${patch.item_rarity}`,
                image: cdn[`econ/patches/${patch.patch_material}_large`],
            };
        case "spray":
            const graffiti = stickerKitsObj[name];
            return {
                id: `graffiti-${graffiti.object_id}`,
                name: graffiti.item_name,
                rarity: `rarity_${graffiti.item_rarity}`,
                image: cdn[`econ/stickers/${graffiti.sticker_material}_large`],
            };
        case "musickit":
            const kit = musicDefinitionsObj[name];
            const exclusive = isExclusive(kit.name);
            return {
                id: `music_kit-${kit.object_id}`,
                name: exclusive ? kit.loc_name : kit.coupon_name,
                rarity: "rarity_rare",
            };
        // The rest are skins
        default:
            let id = "";
            let itemName = "";
            let paint_index = null;
            let phase = null;
            let image = null;
            const translatedName = !isNotWeapon(type)
                ? items[type].item_name_prefab
                : items[type]?.item_name;

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
                const knife = knives.find((k) => k.name == type);
                id = `skin-vanilla-${type}`;
                itemName = {
                    tKey: "rare_special_vanilla",
                    weapon: knife.item_name,
                };
                image = cdn[`econ/weapons/base_weapons/${knife.name}`];
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
                paint_index = paintKits[name.toLowerCase()]?.paint_index;
                phase = getDopplerPhase(
                    paintKits[name.toLowerCase()].paint_index
                );
                image = cdn[`${weaponIcons[1].icon_path.toLowerCase()}_large`];
            }

            return {
                id,
                name: itemName,
                rarity,
                paint_index,
                phase,
                image,
            };
    }
};

export const loadData = async () => {
    await loadItemsGame();
    loadPrefabs();
    loadItems();
    loadItemSets();
    loadStickerKits();
    loadPaintKits();
    loadMusicDefinitions();
    loadClientLootLists();
    loadRevolvingLootLists();
    loadRarities();
    loadSkinsByCrates();
    loadyCratesBySkins();
    loadSouvenirSkins();
    loadStattrakSkins();
};
