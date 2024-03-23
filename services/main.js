import axios from "axios";
import { ITEMS_GAME_URL, getImageUrl } from "../constants.js";
import {
    filterUniqueByAttribute,
    getDopplerPhase,
    getGraffitiVariations,
    isExclusive,
    isNotWeapon,
    knives,
} from "../utils/index.js";
import { rareSpecial } from "../utils/rareSpecial.js";

export const state = {};

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

    // Load also players
    state.players = Object.entries(state.itemsGame.pro_players).reduce(
        (acc, [id, player]) => {
            acc[id] = player.name;
            return acc;
        },
        {}
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
                used_by_classes:
                    value?.used_by_classes ??
                    state.prefabs[value.prefab]?.used_by_classes,
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
                used_by_classes: value.used_by_classes,
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
                !["valve_csgo_01", "valve_csgo_02", "valve_cs2_01"].includes(
                    item.name
                )
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
            if (item === "crate_dhw13_promo") {
                // Source: https://counterstrike.fandom.com/wiki/DreamHack_2013_Souvenir_Package
                items[item] = [
                    "set_dust_2",
                    "set_safehouse",
                    "set_italy",
                    "set_lake",
                    "set_train",
                    "set_mirage",
                ].flatMap((set) =>
                    Object.keys(extractItems(set, clientLootLists)).map(
                        getItemFromKey
                    )
                );

                items[item].push(getItemFromKey("[sp_tape]weapon_revolver"));

                return items;
            }

            if (item === "crate_ems14_promo") {
                // I assume the drops are the same as "DreamHack 2013" but the "R8 Revolver | Bone Mask"
                items[item] = [
                    "set_dust_2",
                    "set_safehouse",
                    "set_italy",
                    "set_lake",
                    "set_train",
                    "set_mirage",
                ].flatMap((set) =>
                    Object.keys(extractItems(set, clientLootLists)).map(
                        getItemFromKey
                    )
                );

                return items;
            }

            items[item] = Object.keys(extractItems(item, clientLootLists)).map(
                getItemFromKey
            );

            return items;
        }, {}),

        // To avoid the loop down below
        set_xraymachine: [getItemFromKey("[cu_xray_p250]weapon_p250")],

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
    const hardCodedCrates = {
        set_xraymachine: {
            object_id: 4668,
            item_name: "#CSGO_set_xraymachine",
            image_inventory: "econ/weapon_cases/crate_xray_p250",
        },
    };

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
                        hardCodedCrates[crateKey] ||
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
                            image: getImageUrl(
                                crateItem?.image_inventory?.toLowerCase()
                            ),
                        });
                    }
                });

                return acc;
            },
            {}
        ),
    };
};

export const loadSkinsByCollections = () => {
    state.skinsByCollections = Object.entries(state.itemsGame.item_sets).reduce(
        (items, [key, value]) => {
            items[key] = Object.keys(value.items).map((item) =>
                getItemFromKey(item)
            );
            return items;
        },
        {
            selfopeningitem_crate_spray_std2_1: [
                ...getItemFromKey("[spray_std2_applause]spray"),
                ...getItemFromKey("[spray_std2_beep]spray"),
                ...getItemFromKey("[spray_std2_boom]spray"),
                ...getItemFromKey("[spray_std2_brightstar]spray"),
                ...getItemFromKey("[spray_std2_brokenheart]spray"),
                getItemFromKey("[spray_std2_chef_kiss]spray"),
                getItemFromKey("[spray_std2_chick]spray"),
                getItemFromKey("[spray_std2_chunkychicken]spray"),
                getItemFromKey("[spray_std2_goofy]spray"),
                getItemFromKey("[spray_std2_grimace]spray"),
                getItemFromKey("[spray_std2_happy_cat]spray"),
                getItemFromKey("[spray_std2_hop]spray"),
                getItemFromKey("[spray_std2_kiss]spray"),
                getItemFromKey("[spray_std2_lightbulb]spray"),
                getItemFromKey("[spray_std2_little_crown]spray"),
                getItemFromKey("[spray_std2_omg]spray"),
                getItemFromKey("[spray_std2_silverbullet]spray"),
                getItemFromKey("[spray_std2_smirk]spray"),
                getItemFromKey("[spray_std2_thoughtfull]spray"),
            ],
            selfopeningitem_crate_spray_std2_2: [
                ...getItemFromKey("[spray_std2_1g]spray"),
                ...getItemFromKey("[spray_std2_200iq]spray"),
                ...getItemFromKey("[spray_std2_bubble_denied]spray"),
                ...getItemFromKey("[spray_std2_bubble_question]spray"),
                getItemFromKey("[spray_std2_choke]spray"),
                getItemFromKey("[spray_std2_dead_now]spray"),
                getItemFromKey("[spray_std2_fart]spray"),
                getItemFromKey("[spray_std2_little_ez]spray"),
                getItemFromKey("[spray_std2_littlebirds]spray"),
                getItemFromKey("[spray_std2_nt]spray"),
                getItemFromKey("[spray_std2_okay]spray"),
                getItemFromKey("[spray_std2_oops]spray"),
                getItemFromKey("[spray_std2_puke]spray"),
                getItemFromKey("[spray_std2_rly]spray"),
                getItemFromKey("[spray_std2_smarm]spray"),
                getItemFromKey("[spray_std2_smooch]spray"),
                getItemFromKey("[spray_std2_uhoh]spray"),
            ],
            selfopeningitem_crate_spray_std3: [
                getItemFromKey("[spray_std3_ak47]spray"),
                getItemFromKey("[spray_std3_aug]spray"),
                getItemFromKey("[spray_std3_awp]spray"),
                getItemFromKey("[spray_std3_bizon]spray"),
                getItemFromKey("[spray_std3_cz]spray"),
                getItemFromKey("[spray_std3_famas]spray"),
                getItemFromKey("[spray_std3_galil]spray"),
                getItemFromKey("[spray_std3_m4a1]spray"),
                getItemFromKey("[spray_std3_m4a4]spray"),
                getItemFromKey("[spray_std3_mac10]spray"),
                getItemFromKey("[spray_std3_mp7]spray"),
                getItemFromKey("[spray_std3_mp9]spray"),
                getItemFromKey("[spray_std3_p90]spray"),
                getItemFromKey("[spray_std3_sg553]spray"),
                getItemFromKey("[spray_std3_ump]spray"),
                getItemFromKey("[spray_std3_xm1014]spray"),
            ],
        }
    );
};

export const loadCratesByCollections = () => {
    state.cratesByCollections = Object.entries(state.skinsByCollections).reduce(
        (acc, [collection, items]) => {
            const itemsId = [...new Set(items.map(({ id }) => id))];
            const crates = itemsId.flatMap(
                (id) => state.cratesBySkins[id] ?? []
            );

            acc[collection] = filterUniqueByAttribute(crates, "id");

            return acc;
        }
    );
};

export const loadCollectionsBySkins = () => {
    state.collectionsBySkins = Object.entries(state.skinsByCollections).reduce(
        (acc, [crateKey, itemsList]) => {
            crateKey = crateKey.replace("rare--", "");

            itemsList.forEach((item) => {
                if (!(item.id in acc)) {
                    acc[item.id] = [];
                }

                const crateItem = state.itemsGame.item_sets[crateKey];

                if (crateItem != null) {
                    acc[item.id].push({
                        id: `collection-${crateItem.name
                            .replace("#CSGO_", "")
                            .replace(/_/g, "-")}`,
                        name: crateItem.name,
                        image: getImageUrl(
                            `econ/set_icons/${crateItem.name.replace(
                                "#CSGO_",
                                ""
                            )}`
                        ),
                    });
                }
            });

            return acc;
        },
        {}
    );
};

export const loadSouvenirSkins = () => {
    state.souvenirSkins = {
        ...Object.values(state.items)
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
            .reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),

        "skin-1510528": true, // MP5-SD | Lab Rats
    };
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

    const result = {
        "[cu_m4a1_howling]weapon_m4a1": true,
    };

    const skipCollections = ["#CSGO_set_dust_2_2021"];

    itemSets.forEach((item) => {
        if (item.is_collection && !skipCollections.includes(item.name)) {
            Object.keys(item.items).forEach((key) => {
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
            id: `collectible-${pin.object_id}`,
            name: pin.item_name,
            rarity: `rarity_${pin.item_rarity}`,
        };
    }

    if (key.startsWith("customplayer_")) {
        const agent = items[key];
        return {
            id: `agent-${agent.object_id}`,
            name: agent.item_name,
            rarity: `rarity_${agent.item_rarity}_character`,
            image: getImageUrl(
                `econ/characters/${agent.name.toLocaleLowerCase()}`
            ),
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
                image: getImageUrl(
                    `econ/stickers/${sticker.sticker_material.toLowerCase()}`
                ),
            };
        case "patch":
            const patch = stickerKitsObj[name];
            return {
                id: `${type}-${patch.object_id}`,
                name: patch.item_name,
                rarity: `rarity_${patch.item_rarity}`,
                image: getImageUrl(`econ/patches/${patch.patch_material}`),
            };
        case "spray":
            const graffiti = stickerKitsObj[name];
            const variations = getGraffitiVariations(name);

            if (variations.length > 0) {
                if (variations[0] === "attrib_spraytintvalue_0") {
                    return Array.from({ length: 19 }, (_, index) => {
                        return {
                            id: `graffiti-${graffiti.object_id}_${index + 1}`,
                            name: graffiti.item_name,
                            rarity: `rarity_${graffiti.item_rarity}`,
                            image: getImageUrl(
                                `econ/stickers/${graffiti.sticker_material}_${
                                    index + 1
                                }`
                            ),
                        };

                        // const colorKey = `attrib_spraytintvalue_${index + 1}`;
                        // return {
                        //     id: `graffiti-${item.object_id}_${index + 1}`,
                        //     name: `${$t("csgo_tool_spray")} | ${$t(
                        //         item.item_name
                        //     )} (${$t(colorKey)})`,
                        //     description: getDescription(item),
                        //     rarity: {
                        //         id: `rarity_${item.item_rarity}`,
                        //         name: $t(`rarity_${item.item_rarity}`),
                        //         color: getRarityColor(`rarity_${item.item_rarity}`),
                        //     },
                        //     special_notes: specialNotes?.[`graffiti-${item.object_id}`],
                        //     crates:
                        //         cratesBySkins?.[`graffiti-${item.object_id}`]?.map(
                        //             (i) => ({
                        //                 ...i,
                        //                 name: $t(i.name),
                        //             })
                        //         ) ?? [],
                        //     image: getImageUrl(
                        //         `econ/stickers/${item.sticker_material}_${index + 1}`
                        //     ),
                        // };
                    });
                }
            }

            return {
                id: `graffiti-${graffiti.object_id}`,
                name: graffiti.item_name,
                rarity: `rarity_${graffiti.item_rarity}`,
                image: getImageUrl(
                    `econ/stickers/${graffiti.sticker_material}`
                ),
            };
        case "musickit":
            const kit = musicDefinitionsObj[name];
            const exclusive = isExclusive(kit.name);
            return {
                id: `music_kit-${kit.object_id}`,
                name: exclusive ? kit.loc_name : kit.coupon_name,
                rarity: "rarity_rare",
                image: getImageUrl(kit.image_inventory),
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
                image = getImageUrl(`econ/weapons/base_weapons/${knife.name}`);
            } else {
                const weaponIcons = Object.entries(
                    itemsGame.alternate_icons2.weapon_icons
                ).find(
                    ([, value]) =>
                        value.icon_path.includes(name) &&
                        value.icon_path.includes(type) &&
                        (name.includes("newcs2")
                            ? true
                            : !value.icon_path.includes("newcs2"))
                );

                // TODO: Remove this in the future.
                // Added because of a problem loading `Revolution Case` skin's images.
                // if (weaponIcons[1].icon_path.includes("_newcs2")) {
                // weaponIcons[1].icon_path = weaponIcons[1].icon_path.replace(
                //     "_newcs2",
                //     ""
                // );
                // }

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
                image = getImageUrl(
                    `${weaponIcons[1].icon_path.toLowerCase()}`
                );
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

export const getManifestId = async () => {
    return axios
        .get(
            "https://raw.githubusercontent.com/ByMykel/counter-strike-file-tracker/main/static/manifestId.txt"
        )
        .then((data) => data.data)
        .catch(() => {
            throw new Error(`Error loading latest manifest Id`);
        });
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
    loadSkinsByCollections();
    loadCratesByCollections();
    loadCollectionsBySkins();
    loadSouvenirSkins();
    loadStattrakSkins();
};
