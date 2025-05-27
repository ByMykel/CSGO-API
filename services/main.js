import axios from "axios";
import sha1 from "sha1";
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
            // Had to hardcode this because it's easier.
            state.itemsGame.item_sets["set_kc_missinglink"] = {
                name: "#CSGO_set_kc_missinglink",
                name_force: "#CSGO_crate_keychain_pack_kc_missinglink_capsule",
                set_description:
                    "#CSGO_crate_keychain_pack_kc_missinglink_capsule_desc",
                is_collection: 1,
                items: {
                    "[kc_missinglink_ava]keychain": 1,
                    "[kc_missinglink_ava]keychain": 1,
                    "[kc_missinglink_sam_salty]keychain": 1,
                    "[kc_missinglink_sam_catchup]keychain": 1,
                    "[kc_missinglink_sas]keychain": 1,
                    "[kc_missinglink_guerilla]keychain": 1,
                    "[kc_missinglink_kev]keychain": 1,
                    "[kc_missinglink_chicken]keychain": 1,
                    "[kc_missinglink_banana]keychain": 1,
                    "[kc_missinglink_cat]keychain": 1,
                    "[kc_missinglink_catbeach]keychain": 1,
                    "[kc_missinglink_bigfoot]keychain": 1,
                    "[kc_missinglink_sam_toile]keychain": 1,
                    "[kc_missinglink_monster]keychain": 1,
                    "[kc_missinglink_sam_diamond]keychain": 1,
                    "[kc_missinglink_sam_shape]keychain": 1,
                    "[kc_missinglink_howl]keychain": 1,
                    "[kc_missinglink_wurst]keychain": 1,
                },
            };
            state.itemsGame.item_sets["set_kc_weapon_01"] = {
                name: "#CSGO_set_kc_weapon_01",
                name_force: "#CSGO_crate_keychain_pack_kc_weapon_01_capsule",
                is_collection: 1,
                items: {
                    "[kc_wpn_ak_base]keychain": 1,
                    "[kc_wpn_usp_yarn]keychain": 1,
                    "[kc_wpn_tec9_cap]keychain": 1,
                    "[kc_wpn_awp_plastic]keychain": 1,
                    "[kc_wpn_mac10_tile]keychain": 1,
                    "[kc_wpn_ctknife_wood]keychain": 1,
                    "[kc_wpn_m4a1s_comic]keychain": 1,
                    "[kc_wpn_usp_jewel]keychain": 1,
                    "[kc_wpn_ak_jelly]keychain": 1,
                    "[kc_wpn_mac10_glitter]keychain": 1,
                    "[kc_wpn_tec9_magma]keychain": 1,
                    "[kc_wpn_awp_spoon]keychain": 1,
                    "[kc_wpn_m4a1s_ss]keychain": 1,
                    "[kc_wpn_tknife_crystal]keychain": 1,
                    "[kc_wpn_ctknife_gold]keychain": 1,
                    "[kc_wpn_tknife_gold]keychain": 1,
                },
            };
            state.itemsGame.item_sets["set_stkr_craft_01"] = {
                name: "#CSGO_set_stkr_craft_01",
                name_force: "#CSGO_crate_sticker_pack_stkr_craft_01_capsule",
                is_collection: 1,
                items: {
                    "[paper_lightning_two]sticker": 1,
                    "[paper_lightning_three]sticker": 1,
                    "[paper_lightning_one]sticker": 1,
                    "[paper_flames_two]sticker": 1,
                    "[paper_flames]sticker": 1,
                    "[paper_fire_one]sticker": 1,
                    "[paper_fire_two]sticker": 1,
                    "[paper_fire_three]sticker": 1,
                    "[paper_explosion_two]sticker": 1,
                    "[paper_explosion_three]sticker": 1,
                    "[paper_explosion_one]sticker": 1,
                    "[paper_explosion_four]sticker": 1,
                    "[paper_water_one]sticker": 1,
                    "[paper_water_two]sticker": 1,
                    "[paper_water_three]sticker": 1,
                    "[holo_rainbow_trail]sticker": 1,
                    "[glitter_explosion_two]sticker": 1,
                    "[glitter_explosion_three]sticker": 1,
                    "[glitter_explosion_one]sticker": 1,
                    "[glitter_explosion_four]sticker": 1,
                    "[foil_lightning_two]sticker": 1,
                    "[foil_lightning_three]sticker": 1,
                    "[foil_lightning_one]sticker": 1,
                    "[foil_fire_three]sticker": 1,
                    "[lenticular_blood_one]sticker": 1,
                    "[lenticular_blood_two]sticker": 1,
                },
            };
            state.itemsGame.item_sets["set_stkr_craft_02"] = {
                name: "#CSGO_set_stkr_craft_02",
                name_force: "#CSGO_crate_sticker_pack_stkr_craft_02_capsule",
                is_collection: 1,
                items: {
                    "[paper_arm_flex]sticker": 1,
                    "[paper_clown_nose]sticker": 1,
                    "[paper_clown_wig]sticker": 1,
                    "[paper_ct_left_hand]sticker": 1,
                    "[paper_eye]sticker": 1,
                    "[paper_googly_eye_small]sticker": 1,
                    "[paper_male_anime_face]sticker": 1,
                    "[paper_mouth]sticker": 1,
                    "[paper_ribbon]sticker": 1,
                    "[paper_shark_mouth]sticker": 1,
                    "[paper_t_left_hand]sticker": 1,
                    "[paper_tentacle]sticker": 1,
                    "[paper_tongue]sticker": 1,
                    "[paper_wings]sticker": 1,
                    "[paper_winky_eyes]sticker": 1,
                    "[glitter_kawaii_eyes]sticker": 1,
                    "[glitter_tentacle]sticker": 1,
                    "[holo_mouth]sticker": 1,
                    "[holo_tongue]sticker": 1,
                    "[lenticular_angry_eyes]sticker": 1,
                    "[foil_mustache]sticker": 1,
                    "[foil_sunglasses]sticker": 1,
                    "[foil_mouth]sticker": 1,
                    "[lenticular_cheeky_eyes]sticker": 1,
                    "[lenticular_googly_eye]sticker": 1
                },
            };
        })
        .catch(() => {
            throw new Error(`Error loading items_game.txt from ${ITEMS_GAME_URL}`);
        });

    await axios
        .get("https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/refs/heads/main/static/default_generated.json")
        .then((data) => {
            state.itemsGame.alternate_icons2.weapon_icons = data.data.filter(item => {
                // We have heavy, light and medium
                if (!item.includes('light_png.png')) return false
                // Chickens
                if (item.includes('pet_hen_1_hen')) return false
                return true
            }).reduce((acc, item) => {
                acc[sha1(item.replace("_light_png.png", "")).slice(0, 12)] = {
                    icon_path: `econ/default_generated/${item.replace("_png.png", "")}`,
                };
                return acc;
            }, {});
        })
        .catch(() => {
            throw new Error(`Error formatting alternate_icons2.weapon_icons`);
        });
};

export const loadItemSets = () => {
    state.itemSets = Object.values(state.itemsGame.item_sets);
};

export const loadStickerKits = () => {
    state.stickerKits = Object.entries(state.itemsGame.sticker_kits).map(
        ([key, item]) => {
            if (item.name === "comm01_howling_dawn") {
                item.item_rarity = "contraband";
            }

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
            acc[id] = player.name.toString();
            return acc;
        },
        {}
    );
};

export const loadKeychainDefinitions = () => {
    state.keychainDefinitions = Object.entries(
        state.itemsGame.keychain_definitions
    ).map(([key, item]) => ({
        ...item,
        object_id: key,
    }));

    state.keychainDefinitionsObj = Object.fromEntries(
        state.keychainDefinitions.map((item) => [item.name, item])
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
                item_description_prefab: state.prefabs[value.prefab]?.item_description,
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
                    value.first_sale_date ?? innerPrefab?.first_sale_date ?? null,
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
                    style_id: item.style ?? 0,
                    style_name: `SFUI_ItemInfo_FinishStyle_${item.style ?? 0}`,
                    legacy_model: !!item.use_legacy_model ?? false,
                };
            }
            return acc;
        },
        {}
    );
};

export const loadMusicDefinitions = () => {
    state.musicDefinitions = Object.entries(state.itemsGame.music_definitions)
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
                    Object.keys(extractItems(set, clientLootLists)).map(getItemFromKey)
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
                    Object.keys(extractItems(set, clientLootLists)).map(getItemFromKey)
                );

                return items;
            }

            items[item] = Object.keys(extractItems(item, clientLootLists)).map(
                getItemFromKey
            );

            if (item.includes("_stattrak_") && item.includes("musickit")) {
                items[item] = items[item].map((item) => ({
                    ...item,
                    id: `${item.id}_st`,
                    name: `${item.name}_stattrak`,
                }));
            }

            return items;
        }, {}),

        // To avoid the loop down below
        set_xraymachine: [getItemFromKey("[cu_xray_p250]weapon_p250")],

        // Rare special
        ...Object.values(revolvingLootLists).reduce((items, item) => {
            items[`rare--${item}`] = extractRareItems(item, clientLootLists).map(
                getItemFromKey
            );

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

                    const lootList = Object.entries(state.revolvingLootLists).find(
                        ([id, item]) => item === crateKey
                    );

                    const crateItem =
                        hardCodedCrates[crateKey] ||
                        state.items[crateKey] ||
                        Object.values(state.items).find(
                            (i) =>
                                i.attributes?.["set supply crate series"]?.value ==
                                lootList?.[0]
                        );

                    if (crateItem != null) {
                        acc[item.id].push({
                            id: `crate-${crateItem.object_id}`,
                            name: crateItem.item_name,
                            image: getImageUrl(crateItem?.image_inventory?.toLowerCase()),
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
            items[key] = Object.keys(value.items).map((item) => getItemFromKey(item));
            return items;
        },
        {
            selfopeningitem_crate_spray_std2_1: [
                ...getItemFromKey("[spray_std2_applause]spray"),
                ...getItemFromKey("[spray_std2_beep]spray"),
                ...getItemFromKey("[spray_std2_boom]spray"),
                ...getItemFromKey("[spray_std2_brightstar]spray"),
                ...getItemFromKey("[spray_std2_brokenheart]spray"),
                ...getItemFromKey("[spray_std2_chef_kiss]spray"),
                ...getItemFromKey("[spray_std2_chick]spray"),
                ...getItemFromKey("[spray_std2_chunkychicken]spray"),
                ...getItemFromKey("[spray_std2_goofy]spray"),
                ...getItemFromKey("[spray_std2_grimace]spray"),
                ...getItemFromKey("[spray_std2_happy_cat]spray"),
                ...getItemFromKey("[spray_std2_hop]spray"),
                ...getItemFromKey("[spray_std2_kiss]spray"),
                ...getItemFromKey("[spray_std2_lightbulb]spray"),
                ...getItemFromKey("[spray_std2_little_crown]spray"),
                ...getItemFromKey("[spray_std2_omg]spray"),
                ...getItemFromKey("[spray_std2_silverbullet]spray"),
                ...getItemFromKey("[spray_std2_smirk]spray"),
                ...getItemFromKey("[spray_std2_thoughtfull]spray"),
            ],
            selfopeningitem_crate_spray_std2_2: [
                ...getItemFromKey("[spray_std2_1g]spray"),
                ...getItemFromKey("[spray_std2_200iq]spray"),
                ...getItemFromKey("[spray_std2_bubble_denied]spray"),
                ...getItemFromKey("[spray_std2_bubble_question]spray"),
                ...getItemFromKey("[spray_std2_choke]spray"),
                ...getItemFromKey("[spray_std2_dead_now]spray"),
                ...getItemFromKey("[spray_std2_fart]spray"),
                ...getItemFromKey("[spray_std2_little_ez]spray"),
                ...getItemFromKey("[spray_std2_littlebirds]spray"),
                ...getItemFromKey("[spray_std2_nt]spray"),
                ...getItemFromKey("[spray_std2_okay]spray"),
                ...getItemFromKey("[spray_std2_oops]spray"),
                ...getItemFromKey("[spray_std2_puke]spray"),
                ...getItemFromKey("[spray_std2_rly]spray"),
                ...getItemFromKey("[spray_std2_smarm]spray"),
                ...getItemFromKey("[spray_std2_smooch]spray"),
                ...getItemFromKey("[spray_std2_uhoh]spray"),
            ],
            selfopeningitem_crate_spray_std3: [
                ...getItemFromKey("[spray_std3_ak47]spray"),
                ...getItemFromKey("[spray_std3_aug]spray"),
                ...getItemFromKey("[spray_std3_awp]spray"),
                ...getItemFromKey("[spray_std3_bizon]spray"),
                ...getItemFromKey("[spray_std3_cz]spray"),
                ...getItemFromKey("[spray_std3_famas]spray"),
                ...getItemFromKey("[spray_std3_galil]spray"),
                ...getItemFromKey("[spray_std3_m4a1]spray"),
                ...getItemFromKey("[spray_std3_m4a4]spray"),
                ...getItemFromKey("[spray_std3_mac10]spray"),
                ...getItemFromKey("[spray_std3_mp7]spray"),
                ...getItemFromKey("[spray_std3_mp9]spray"),
                ...getItemFromKey("[spray_std3_p90]spray"),
                ...getItemFromKey("[spray_std3_sg553]spray"),
                ...getItemFromKey("[spray_std3_ump]spray"),
                ...getItemFromKey("[spray_std3_xm1014]spray"),
            ],
        }
    );
};

export const loadCratesByCollections = () => {
    state.cratesByCollections = Object.entries(state.skinsByCollections).reduce(
        (acc, [collection, items]) => {
            const itemsId = [...new Set(items.map(({ id }) => id))];
            const crates = itemsId.flatMap((id) => state.cratesBySkins[id] ?? []);

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
                        name: crateItem.name_force ?? crateItem.name,
                        image: getImageUrl(
                            `econ/set_icons/${crateItem.name.replace("#CSGO_", "")}`
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
                return item.prefab === "weapon_case_souvenirpkg" || item.prefab?.includes("_souvenir_crate_promo_prefab");
            })
            .map((item) => {
                const lootListName = item?.loot_list_name ?? null;
                const attributeValue =
                    item.attributes?.["set supply crate series"]?.value ?? null;
                const keyLootList =
                    lootListName ?? state.revolvingLootLists[attributeValue] ?? null;

                return (
                    state.skinsByCrates?.[item.tags?.ItemSet?.tag_value] ??
                    state.skinsByCrates?.[keyLootList] ??
                    []
                );
            })
            .flatMap((level1) => level1)
            .reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),

        "skin-e73d6e7e9004": true, // MP5-SD | Lab Rats
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
        "[cu_xray_p250]weapon_p250": true,
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
        keychainDefinitionsObj,
    } = state;

    if (key.includes("Commodity Pin")) {
        const pin = items[key];
        return {
            id: `collectible-${pin.object_id}`,
            name: pin.item_name,
            rarity: `rarity_${pin.item_rarity}`,
            image: getImageUrl(pin.image_inventory),
        };
    }

    if (key.startsWith("customplayer_")) {
        const agent = items[key];
        return {
            id: `agent-${agent.object_id}`,
            name: agent.item_name,
            rarity: `rarity_${agent.item_rarity}_character`,
            image: getImageUrl(`econ/characters/${agent.name.toLocaleLowerCase()}`),
        };
    }

    const regex = /\[(?<name>.+?)\](?<type>.+)/;
    const match = key.match(regex);
    if (!match) {
        return;
    }
    let { name, type } = match.groups;

    if (name === 'cu_bizon_Curse') {
        name = name.toLowerCase()
    }

    if (type === "sticker") {
        const sticker = stickerKitsObj[name];
        return {
            id: `${type}-${sticker.object_id}`,
            name: sticker.item_name,
            rarity: `rarity_${sticker.item_rarity}`,
            image: getImageUrl(
                `econ/stickers/${sticker.sticker_material.toLowerCase()}`
            ),
        };
    }

    if (type === "patch") {
        const patch = stickerKitsObj[name];
        return {
            id: `${type}-${patch.object_id}`,
            name: patch.item_name,
            rarity: `rarity_${patch.item_rarity}`,
            image: getImageUrl(`econ/patches/${patch.patch_material}`),
        };
    }

    if (type === "spray") {
        const graffiti = stickerKitsObj[name];
        const variations = getGraffitiVariations(name);
        const variationsIndex =
            variations[0] === 0
                ? Array.from({ length: 19 }, (_, index) => index + 1)
                : variations;

        if (variationsIndex.length > 0) {
            return variationsIndex.map((index) => ({
                id: `graffiti-${graffiti.object_id}_${index}`,
                name: graffiti.item_name,
                rarity: `rarity_${graffiti.item_rarity}`,
                image: getImageUrl(
                    `econ/stickers/${graffiti.sticker_material}_${index}`
                ),
            }));
        }

        return {
            id: `graffiti-${graffiti.object_id}`,
            name: graffiti.item_name,
            rarity: `rarity_${graffiti.item_rarity}`,
            image: getImageUrl(`econ/stickers/${graffiti.sticker_material}`),
        };
    }

    if (type === "musickit") {
        const kit = musicDefinitionsObj[name];
        const exclusive = isExclusive(kit.name);
        return {
            id: `music_kit-${kit.object_id}`,
            name: exclusive ? kit.loc_name : kit.coupon_name,
            rarity: "rarity_rare",
            image: getImageUrl(kit.image_inventory),
        };
    }

    if (type === "keychain") {
        const keychain = keychainDefinitionsObj[name];
        return {
            id: `keychain-${keychain.object_id}`,
            name: keychain.loc_name,
            rarity: `rarity_${keychain.item_rarity}`,
            image: getImageUrl(keychain.image_inventory.toLowerCase()),
        };
    }

    if (
        type.includes("weapon_") ||
        [
            "studded_bloodhound_gloves",
            "slick_gloves",
            "leather_handwraps",
            "motorcycle_gloves",
            "specialist_gloves",
            "sporty_gloves",
            "studded_hydra_gloves",
            "studded_brokenfang_gloves",
        ].includes(type)
    ) {
        let id = "";
        let itemName = "";
        let paint_index = null;
        let phase = null;
        let image = null;
        const translatedName = !isNotWeapon(type)
            ? items[type].item_name_prefab
            : items[type]?.item_name;

        const isKnife =
            type.includes("weapon_knife") || type.includes("weapon_bayonet");

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
                ([, value]) => value.icon_path.includes(`${type}_${name}_light`)
            );

            id = `skin-${weaponIcons[0]}`;
            itemName = {
                ...(isNotWeapon(type) && { tKey: "rare_special" }),
                weapon: translatedName.replace("#", ""),
                pattern: paintKits[name.toLowerCase()].description_tag.replace("#", ""),
            };
            paint_index = paintKits[name.toLowerCase()]?.paint_index;
            phase = getDopplerPhase(paintKits[name.toLowerCase()].paint_index);
            image = getImageUrl(`${weaponIcons[1].icon_path.toLowerCase()}`);
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

    console.error(`Unknown item type: ${type}`);
};

export const getManifestId = async () => {
    return axios
        .get(
            `https://raw.githubusercontent.com/ByMykel/counter-strike-file-tracker/main/static/manifestId.txt`
        )
        .then((data) => data.data)
        .catch(() => {
            throw new Error(`Error loading latest manifest Id`);
        });
};

export const getManifestIdFromImageTracker = async () => {
    return axios
        .get(
            `https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/manifestId.txt`
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
    loadKeychainDefinitions();
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
