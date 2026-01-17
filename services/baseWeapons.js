import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { getImageUrl } from "../constants.js";
import { weaponIDMapping, getCategory } from "../utils/index.js";
import { state } from "./main.js";

export const getBaseWeapons = () => {
    const { cdnImages } = state;
    const { folder } = languageData;

    const baseWeapons = [
        {
            id: "base_weapon-ct_gloves",
            name: $t(`csgo_wearable_ct_defaultgloves`),
            description: $t(`csgo_wearable_ct_defaultgloves_desc`),
            def_index: weaponIDMapping.ct_gloves,
            category: {
                id: getCategory("ct_gloves"),
                name: $t(getCategory("ct_gloves")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/ct_gloves"] ??
                getImageUrl(`econ/weapons/base_weapons/ct_gloves`),
        },
        {
            id: "base_weapon-t_gloves",
            name: $t(`csgo_wearable_t_defaultgloves`),
            description: $t(`csgo_wearable_t_defaultgloves_desc`),
            def_index: weaponIDMapping.t_gloves,
            category: {
                id: getCategory("t_gloves"),
                name: $t(getCategory("t_gloves")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/t_gloves"] ??
                getImageUrl(`econ/weapons/base_weapons/t_gloves`),
        },
        {
            id: "base_weapon-weapon_ak47",
            name: $t(`sfui_wpnhud_ak47`),
            description: $t(`csgo_item_desc_ak47`),
            def_index: weaponIDMapping.weapon_ak47,
            category: {
                id: getCategory("weapon_ak47"),
                name: $t(getCategory("weapon_ak47")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_ak47"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_ak47`),
        },
        {
            id: "base_weapon-weapon_aug",
            name: $t(`sfui_wpnhud_aug`),
            description: $t(`csgo_item_desc_aug`),
            def_index: weaponIDMapping.weapon_aug,
            category: {
                id: getCategory("weapon_aug"),
                name: $t(getCategory("weapon_aug")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_aug"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_aug`),
        },
        {
            id: "base_weapon-weapon_awp",
            name: $t(`sfui_wpnhud_awp`),
            description: $t(`csgo_item_desc_awp`),
            def_index: weaponIDMapping.weapon_awp,
            category: {
                id: getCategory("weapon_awp"),
                name: $t(getCategory("weapon_awp")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_awp"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_awp`),
        },
        {
            id: "base_weapon-weapon_bayonet",
            name: $t(`sfui_wpnhud_knifebayonet`),
            description: $t(`csgo_item_desc_knife_bayonet`),
            def_index: weaponIDMapping.weapon_bayonet,
            category: {
                id: getCategory("weapon_bayonet"),
                name: $t(getCategory("weapon_bayonet")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_bayonet"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_bayonet`),
        },
        {
            id: "base_weapon-weapon_bizon",
            name: $t(`sfui_wpnhud_bizon`),
            description: $t(`csgo_item_desc_bizon`),
            def_index: weaponIDMapping.weapon_bizon,
            category: {
                id: getCategory("weapon_bizon"),
                name: $t(getCategory("weapon_bizon")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_bizon"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_bizon`),
        },
        {
            id: "base_weapon-weapon_c4",
            name: $t(`sfui_wpnhud_c4`),
            description: $t(`csgo_item_desc_c4`),
            def_index: weaponIDMapping.weapon_c4,
            category: {
                id: getCategory("weapon_c4"),
                name: $t(getCategory("weapon_c4")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_c4"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_c4`),
        },
        {
            id: "base_weapon-weapon_cz75a",
            name: $t(`sfui_wpnhud_cz75`),
            description: $t(`csgo_item_desc_cz75a`),
            def_index: weaponIDMapping.weapon_cz75a,
            category: {
                id: getCategory("weapon_cz75a"),
                name: $t(getCategory("weapon_cz75a")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_cz75a"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_cz75a`),
        },
        {
            id: "base_weapon-weapon_deagle",
            name: $t(`sfui_wpnhud_deagle`),
            description: $t(`csgo_item_desc_deserteagle`),
            def_index: weaponIDMapping.weapon_deagle,
            category: {
                id: getCategory("weapon_deagle"),
                name: $t(getCategory("weapon_deagle")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_deagle"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_deagle`),
        },
        {
            id: "base_weapon-weapon_decoy",
            name: $t(`sfui_wpnhud_decoy`),
            description: $t(`csgo_item_desc_decoy`),
            def_index: weaponIDMapping.weapon_decoy,
            category: {
                id: getCategory("weapon_decoy"),
                name: $t(getCategory("weapon_decoy")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_decoy"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_decoy`),
        },
        {
            id: "base_weapon-weapon_elite",
            name: $t(`sfui_wpnhud_elite`),
            description: $t(`csgo_item_desc_elites`),
            def_index: weaponIDMapping.weapon_elite,
            category: {
                id: getCategory("weapon_elite"),
                name: $t(getCategory("weapon_elite")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_elite"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_elite`),
        },
        {
            id: "base_weapon-weapon_famas",
            name: $t(`sfui_wpnhud_famas`),
            description: $t(`csgo_item_desc_famas`),
            def_index: weaponIDMapping.weapon_famas,
            category: {
                id: getCategory("weapon_famas"),
                name: $t(getCategory("weapon_famas")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_famas"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_famas`),
        },
        {
            id: "base_weapon-weapon_fiveseven",
            name: $t(`sfui_wpnhud_fiveseven`),
            description: $t(`csgo_item_desc_fiveseven`),
            def_index: weaponIDMapping.weapon_fiveseven,
            category: {
                id: getCategory("weapon_fiveseven"),
                name: $t(getCategory("weapon_fiveseven")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_fiveseven"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_fiveseven`),
        },
        {
            id: "base_weapon-weapon_flashbang",
            name: $t(`sfui_wpnhud_flashbang`),
            description: $t(`csgo_item_desc_flashbang`),
            def_index: weaponIDMapping.weapon_flashbang,
            category: {
                id: getCategory("weapon_flashbang"),
                name: $t(getCategory("weapon_flashbang")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_flashbang"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_flashbang`),
        },
        {
            id: "base_weapon-weapon_g3sg1",
            name: $t(`sfui_wpnhud_g3sg1`),
            description: $t(`csgo_item_desc_g3sg1`),
            def_index: weaponIDMapping.weapon_g3sg1,
            category: {
                id: getCategory("weapon_g3sg1"),
                name: $t(getCategory("weapon_g3sg1")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_g3sg1"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_g3sg1`),
        },
        {
            id: "base_weapon-weapon_galilar",
            name: $t(`sfui_wpnhud_galilar`),
            description: $t(`csgo_item_desc_galilar`),
            def_index: weaponIDMapping.weapon_galilar,
            category: {
                id: getCategory("weapon_galilar"),
                name: $t(getCategory("weapon_galilar")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_galilar"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_galilar`),
        },
        {
            id: "base_weapon-weapon_glock",
            name: $t(`sfui_wpnhud_glock18`),
            description: $t(`csgo_item_desc_glock18`),
            def_index: weaponIDMapping.weapon_glock,
            category: {
                id: getCategory("weapon_glock"),
                name: $t(getCategory("weapon_glock")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_glock"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_glock`),
        },
        {
            id: "base_weapon-weapon_healthshot",
            name: $t(`sfui_wpnhud_healthshot`),
            description: $t(`csgo_item_desc_healthshot`),
            def_index: weaponIDMapping.weapon_healthshot,
            category: {
                id: getCategory("weapon_healthshot"),
                name: $t(getCategory("weapon_healthshot")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_healthshot"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_healthshot`),
        },
        {
            id: "base_weapon-weapon_hegrenade",
            name: $t(`sfui_wpnhud_hegrenade`),
            description: $t(`csgo_item_desc_hegrenade`),
            def_index: weaponIDMapping.weapon_hegrenade,
            category: {
                id: getCategory("weapon_hegrenade"),
                name: $t(getCategory("weapon_hegrenade")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_hegrenade"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_hegrenade`),
        },
        {
            id: "base_weapon-weapon_hkp2000",
            name: $t(`sfui_wpnhud_hkp2000`),
            description: $t(`csgo_item_desc_hkp2000`),
            def_index: weaponIDMapping.weapon_hkp2000,
            category: {
                id: getCategory("weapon_hkp2000"),
                name: $t(getCategory("weapon_hkp2000")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_hkp2000"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_hkp2000`),
        },
        {
            id: "base_weapon-weapon_incgrenade",
            name: $t(`sfui_wpnhud_incgrenade`),
            description: $t(`csgo_item_desc_incgrenade`),
            def_index: weaponIDMapping.weapon_incgrenade,
            category: {
                id: getCategory("weapon_incgrenade"),
                name: $t(getCategory("weapon_incgrenade")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_incgrenade"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_incgrenade`),
        },
        {
            id: "base_weapon-weapon_knife_butterfly",
            name: $t(`sfui_wpnhud_knife_butterfly`),
            description: $t(`csgo_item_desc_knife_butterfly`),
            def_index: weaponIDMapping.weapon_knife_butterfly,
            category: {
                id: getCategory("weapon_knife_butterfly"),
                name: $t(getCategory("weapon_knife_butterfly")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_butterfly"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_butterfly`),
        },
        {
            id: "base_weapon-weapon_knife_canis",
            name: $t(`sfui_wpnhud_knife_canis`),
            description: $t(`csgo_item_desc_knife_canis`),
            def_index: weaponIDMapping.weapon_knife_canis,
            category: {
                id: getCategory("weapon_knife_canis"),
                name: $t(getCategory("weapon_knife_canis")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_canis"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_canis`),
        },
        {
            id: "base_weapon-weapon_knife_cord",
            name: $t(`sfui_wpnhud_knife_cord`),
            description: $t(`csgo_item_desc_knife_cord`),
            def_index: weaponIDMapping.weapon_knife_cord,
            category: {
                id: getCategory("weapon_knife_cord"),
                name: $t(getCategory("weapon_knife_cord")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_cord"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_cord`),
        },
        {
            id: "base_weapon-weapon_knife_css",
            name: $t(`sfui_wpnhud_knifecss`),
            description: $t(`csgo_item_desc_knife_css`),
            def_index: weaponIDMapping.weapon_knife_css,
            category: {
                id: getCategory("weapon_knife_css"),
                name: $t(getCategory("weapon_knife_css")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_css"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_css`),
        },
        {
            id: "base_weapon-weapon_knife_falchion",
            name: $t(`sfui_wpnhud_knife_falchion_advanced`),
            description: $t(`csgo_item_desc_knife_falchion_advanced`),
            def_index: weaponIDMapping.weapon_knife_falchion,
            category: {
                id: getCategory("weapon_knife_falchion"),
                name: $t(getCategory("weapon_knife_falchion")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_falchion"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_falchion`),
        },
        {
            id: "base_weapon-weapon_knife_flip",
            name: $t(`sfui_wpnhud_knifeflip`),
            description: $t(`csgo_item_desc_knifeflip`),
            def_index: weaponIDMapping.weapon_knife_flip,
            category: {
                id: getCategory("weapon_knife_flip"),
                name: $t(getCategory("weapon_knife_flip")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_flip"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_flip`),
        },
        {
            id: "base_weapon-weapon_knife_gut",
            name: $t(`sfui_wpnhud_knifegut`),
            description: $t(`csgo_item_desc_knifegut`),
            def_index: weaponIDMapping.weapon_knife_gut,
            category: {
                id: getCategory("weapon_knife_gut"),
                name: $t(getCategory("weapon_knife_gut")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_gut"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_gut`),
        },
        {
            id: "base_weapon-weapon_knife_gypsy_jackknife",
            name: $t(`sfui_wpnhud_knife_gypsy_jackknife`),
            description: $t(`csgo_item_desc_knife_gypsy_jackknife`),
            def_index: weaponIDMapping.weapon_knife_gypsy_jackknife,
            category: {
                id: getCategory("weapon_knife_gypsy_jackknife"),
                name: $t(getCategory("weapon_knife_gypsy_jackknife")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_gypsy_jackknife"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_gypsy_jackknife`),
        },
        {
            id: "base_weapon-weapon_knife_karambit",
            name: $t(`sfui_wpnhud_knifekaram`),
            description: $t(`csgo_item_desc_knife_karam`),
            def_index: weaponIDMapping.weapon_knife_karambit,
            category: {
                id: getCategory("weapon_knife_karambit"),
                name: $t(getCategory("weapon_knife_karambit")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_karambit"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_karambit`),
        },
        {
            id: "base_weapon-weapon_knife_kukri",
            name: $t(`sfui_wpnhud_knife_kukri`),
            description: $t(`csgo_item_desc_knife_kukri`),
            def_index: weaponIDMapping.weapon_knife_kukri,
            category: {
                id: getCategory("weapon_knife_kukri"),
                name: $t(getCategory("weapon_knife_kukri")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_kukri"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_kukri`),
        },
        {
            id: "base_weapon-weapon_knife_m9_bayonet",
            name: $t(`sfui_wpnhud_knifem9`),
            description: $t(`csgo_item_desc_knifem9`),
            def_index: weaponIDMapping.weapon_knife_m9_bayonet,
            category: {
                id: getCategory("weapon_knife_m9_bayonet"),
                name: $t(getCategory("weapon_knife_m9_bayonet")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_m9_bayonet"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_m9_bayonet`),
        },
        {
            id: "base_weapon-weapon_knife_outdoor",
            name: $t(`sfui_wpnhud_knife_outdoor`),
            description: $t(`csgo_item_desc_knife_outdoor`),
            def_index: weaponIDMapping.weapon_knife_outdoor,
            category: {
                id: getCategory("weapon_knife_outdoor"),
                name: $t(getCategory("weapon_knife_outdoor")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_outdoor"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_outdoor`),
        },
        {
            id: "base_weapon-weapon_knife",
            name: $t(`sfui_wpnhud_knife`),
            description: $t(`csgo_item_desc_knife`),
            def_index: weaponIDMapping.weapon_knife,
            category: {
                id: getCategory("weapon_knife"),
                name: $t(getCategory("weapon_knife")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife`),
        },
        {
            id: "base_weapon-weapon_knife_push",
            name: $t(`sfui_wpnhud_knife_push`),
            description: $t(`csgo_item_desc_knife_push`),
            def_index: weaponIDMapping.weapon_knife_push,
            category: {
                id: getCategory("weapon_knife_push"),
                name: $t(getCategory("weapon_knife_push")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_push"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_push`),
        },
        {
            id: "base_weapon-weapon_knife_skeleton",
            name: $t(`sfui_wpnhud_knife_skeleton`),
            description: $t(`csgo_item_desc_knife_skeleton`),
            def_index: weaponIDMapping.weapon_knife_skeleton,
            category: {
                id: getCategory("weapon_knife_skeleton"),
                name: $t(getCategory("weapon_knife_skeleton")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_skeleton"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_skeleton`),
        },
        {
            id: "base_weapon-weapon_knife_stiletto",
            name: $t(`sfui_wpnhud_knife_stiletto`),
            description: $t(`csgo_item_desc_knife_stiletto`),
            def_index: weaponIDMapping.weapon_knife_stiletto,
            category: {
                id: getCategory("weapon_knife_stiletto"),
                name: $t(getCategory("weapon_knife_stiletto")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_stiletto"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_stiletto`),
        },
        {
            id: "base_weapon-weapon_knife_survival_bowie",
            name: $t(`sfui_wpnhud_knife_survival_bowie`),
            description: $t(`csgo_item_desc_knife_survival_bowie`),
            def_index: weaponIDMapping.weapon_knife_survival_bowie,
            category: {
                id: getCategory("weapon_knife_survival_bowie"),
                name: $t(getCategory("weapon_knife_survival_bowie")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_survival_bowie"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_survival_bowie`),
        },
        {
            id: "base_weapon-weapon_knife_t",
            name: $t(`sfui_wpnhud_knife_t`),
            description: $t(`csgo_item_desc_knife_t`),
            def_index: weaponIDMapping.weapon_knife_t,
            category: {
                id: getCategory("weapon_knife_t"),
                name: $t(getCategory("weapon_knife_t")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_t"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_t`),
        },
        {
            id: "base_weapon-weapon_knife_tactical",
            name: $t(`sfui_wpnhud_knifetactical`),
            description: $t(`csgo_item_desc_knifetactical`),
            def_index: weaponIDMapping.weapon_knife_tactical,
            category: {
                id: getCategory("weapon_knife_tactical"),
                name: $t(getCategory("weapon_knife_tactical")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_tactical"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_tactical`),
        },
        {
            id: "base_weapon-weapon_knife_ursus",
            name: $t(`sfui_wpnhud_knife_ursus`),
            description: $t(`csgo_item_desc_knife_ursus`),
            def_index: weaponIDMapping.weapon_knife_ursus,
            category: {
                id: getCategory("weapon_knife_ursus"),
                name: $t(getCategory("weapon_knife_ursus")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_ursus"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_ursus`),
        },
        {
            id: "base_weapon-weapon_knife_widowmaker",
            name: $t(`sfui_wpnhud_knife_widowmaker`),
            description: $t(`csgo_item_desc_knife_widowmaker`),
            def_index: weaponIDMapping.weapon_knife_widowmaker,
            category: {
                id: getCategory("weapon_knife_widowmaker"),
                name: $t(getCategory("weapon_knife_widowmaker")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_knife_widowmaker"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_knife_widowmaker`),
        },
        {
            id: "base_weapon-weapon_m249",
            name: $t(`sfui_wpnhud_m249`),
            description: $t(`csgo_item_desc_m249`),
            def_index: weaponIDMapping.weapon_m249,
            category: {
                id: getCategory("weapon_m249"),
                name: $t(getCategory("weapon_m249")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_m249"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_m249`),
        },
        {
            id: "base_weapon-weapon_m4a1",
            name: $t(`sfui_wpnhud_m4a1`),
            description: $t(`csgo_item_desc_m4a4`),
            def_index: weaponIDMapping.weapon_m4a1,
            category: {
                id: getCategory("weapon_m4a1"),
                name: $t(getCategory("weapon_m4a1")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_m4a1"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_m4a1`),
        },
        {
            id: "base_weapon-weapon_m4a1_silencer",
            name: $t(`sfui_wpnhud_m4a1_silencer`),
            description: $t(`csgo_item_desc_m4a1_silencer`),
            def_index: weaponIDMapping.weapon_m4a1_silencer,
            category: {
                id: getCategory("weapon_m4a1_silencer"),
                name: $t(getCategory("weapon_m4a1_silencer")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_m4a1_silencer"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_m4a1_silencer`),
        },
        {
            id: "base_weapon-weapon_mac10",
            name: $t(`sfui_wpnhud_mac10`),
            description: $t(`csgo_item_desc_mac10`),
            def_index: weaponIDMapping.weapon_mac10,
            category: {
                id: getCategory("weapon_mac10"),
                name: $t(getCategory("weapon_mac10")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_mac10"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_mac10`),
        },
        {
            id: "base_weapon-weapon_mag7",
            name: $t(`sfui_wpnhud_mag7`),
            description: $t(`csgo_item_desc_mag7`),
            def_index: weaponIDMapping.weapon_mag7,
            category: {
                id: getCategory("weapon_mag7"),
                name: $t(getCategory("weapon_mag7")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_mag7"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_mag7`),
        },
        {
            id: "base_weapon-weapon_molotov",
            name: $t(`sfui_wpnhud_molotov`),
            description: $t(`csgo_item_desc_molotov`),
            def_index: weaponIDMapping.weapon_molotov,
            category: {
                id: getCategory("weapon_molotov"),
                name: $t(getCategory("weapon_molotov")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_molotov"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_molotov`),
        },
        {
            id: "base_weapon-weapon_mp5sd",
            name: $t(`sfui_wpnhud_mp5sd`),
            description: $t(`csgo_item_desc_mp5sd`),
            def_index: weaponIDMapping.weapon_mp5sd,
            category: {
                id: getCategory("weapon_mp5sd"),
                name: $t(getCategory("weapon_mp5sd")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_mp5sd"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_mp5sd`),
        },
        {
            id: "base_weapon-weapon_mp7",
            name: $t(`sfui_wpnhud_mp7`),
            description: $t(`csgo_item_desc_mp7`),
            def_index: weaponIDMapping.weapon_mp7,
            category: {
                id: getCategory("weapon_mp7"),
                name: $t(getCategory("weapon_mp7")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_mp7"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_mp7`),
        },
        {
            id: "base_weapon-weapon_mp9",
            name: $t(`sfui_wpnhud_mp9`),
            description: $t(`csgo_item_desc_mp9`),
            def_index: weaponIDMapping.weapon_mp9,
            category: {
                id: getCategory("weapon_mp9"),
                name: $t(getCategory("weapon_mp9")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_mp9"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_mp9`),
        },
        {
            id: "base_weapon-weapon_negev",
            name: $t(`sfui_wpnhud_negev`),
            description: $t(`csgo_item_desc_negev`),
            def_index: weaponIDMapping.weapon_negev,
            category: {
                id: getCategory("weapon_negev"),
                name: $t(getCategory("weapon_negev")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_negev"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_negev`),
        },
        {
            id: "base_weapon-weapon_nova",
            name: $t(`sfui_wpnhud_nova`),
            description: $t(`csgo_item_desc_nova`),
            def_index: weaponIDMapping.weapon_nova,
            category: {
                id: getCategory("weapon_nova"),
                name: $t(getCategory("weapon_nova")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_nova"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_nova`),
        },
        {
            id: "base_weapon-weapon_p250",
            name: $t(`sfui_wpnhud_p250`),
            description: $t(`csgo_item_desc_p250`),
            def_index: weaponIDMapping.weapon_p250,
            category: {
                id: getCategory("weapon_p250"),
                name: $t(getCategory("weapon_p250")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_p250"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_p250`),
        },
        {
            id: "base_weapon-weapon_p90",
            name: $t(`sfui_wpnhud_p90`),
            description: $t(`csgo_item_desc_p90`),
            def_index: weaponIDMapping.weapon_p90,
            category: {
                id: getCategory("weapon_p90"),
                name: $t(getCategory("weapon_p90")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_p90"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_p90`),
        },
        {
            id: "base_weapon-weapon_revolver",
            name: $t(`sfui_wpnhud_revolver`),
            description: $t(`csgo_item_desc_revolver`),
            def_index: weaponIDMapping.weapon_revolver,
            category: {
                id: getCategory("weapon_revolver"),
                name: $t(getCategory("weapon_revolver")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_revolver"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_revolver`),
        },
        {
            id: "base_weapon-weapon_sawedoff",
            name: $t(`sfui_wpnhud_sawedoff`),
            description: $t(`csgo_item_desc_sawedoff`),
            def_index: weaponIDMapping.weapon_sawedoff,
            category: {
                id: getCategory("weapon_sawedoff"),
                name: $t(getCategory("weapon_sawedoff")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_sawedoff"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_sawedoff`),
        },
        {
            id: "base_weapon-weapon_scar20",
            name: $t(`sfui_wpnhud_scar20`),
            description: $t(`csgo_item_desc_scar20`),
            def_index: weaponIDMapping.weapon_scar20,
            category: {
                id: getCategory("weapon_scar20"),
                name: $t(getCategory("weapon_scar20")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_scar20"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_scar20`),
        },
        {
            id: "base_weapon-weapon_sg556",
            name: $t(`sfui_wpnhud_sg556`),
            description: $t(`csgo_item_desc_sg553`),
            def_index: weaponIDMapping.weapon_sg556,
            category: {
                id: getCategory("weapon_sg556"),
                name: $t(getCategory("weapon_sg556")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_sg556"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_sg556`),
        },
        {
            id: "base_weapon-weapon_smokegrenade",
            name: $t(`sfui_wpnhud_smokegrenade`),
            description: $t(`csgo_item_desc_smokegrenade`),
            def_index: weaponIDMapping.weapon_smokegrenade,
            category: {
                id: getCategory("weapon_smokegrenade"),
                name: $t(getCategory("weapon_smokegrenade")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_smokegrenade"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_smokegrenade`),
        },
        {
            id: "base_weapon-weapon_ssg08",
            name: $t(`sfui_wpnhud_ssg08`),
            description: $t(`csgo_item_desc_ssg08`),
            def_index: weaponIDMapping.weapon_ssg08,
            category: {
                id: getCategory("weapon_ssg08"),
                name: $t(getCategory("weapon_ssg08")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_ssg08"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_ssg08`),
        },
        {
            id: "base_weapon-weapon_taser",
            name: $t(`sfui_wpnhud_taser`),
            description: $t(`csgo_item_desc_taser`),
            def_index: weaponIDMapping.weapon_taser,
            category: {
                id: getCategory("weapon_taser"),
                name: $t(getCategory("weapon_taser")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_taser"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_taser`),
        },
        {
            id: "base_weapon-weapon_tec9",
            name: $t(`sfui_wpnhud_tec9`),
            description: $t(`csgo_item_desc_tec9`),
            def_index: weaponIDMapping.weapon_tec9,
            category: {
                id: getCategory("weapon_tec9"),
                name: $t(getCategory("weapon_tec9")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_tec9"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_tec9`),
        },
        {
            id: "base_weapon-weapon_ump45",
            name: $t(`sfui_wpnhud_ump45`),
            description: $t(`csgo_item_desc_ump45`),
            def_index: weaponIDMapping.weapon_ump45,
            category: {
                id: getCategory("weapon_ump45"),
                name: $t(getCategory("weapon_ump45")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_ump45"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_ump45`),
        },
        {
            id: "base_weapon-weapon_usp_silencer",
            name: $t(`sfui_wpnhud_usp_silencer`),
            description: $t(`csgo_item_desc_usp_silencer`),
            def_index: weaponIDMapping.weapon_usp_silencer,
            category: {
                id: getCategory("weapon_usp_silencer"),
                name: $t(getCategory("weapon_usp_silencer")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_usp_silencer"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_usp_silencer`),
        },
        {
            id: "base_weapon-weapon_xm1014",
            name: $t(`sfui_wpnhud_xm1014`),
            description: $t(`csgo_item_desc_xm1014`),
            def_index: weaponIDMapping.weapon_xm1014,
            category: {
                id: getCategory("weapon_xm1014"),
                name: $t(getCategory("weapon_xm1014")),
            },
            image:
                cdnImages["econ/weapons/base_weapons/weapon_xm1014"] ??
                getImageUrl(`econ/weapons/base_weapons/weapon_xm1014`),
        },
    ].sort((a, b) => a.def_index - b.def_index);

    saveDataJson(`./public/api/${folder}/base_weapons.json`, baseWeapons);
};
