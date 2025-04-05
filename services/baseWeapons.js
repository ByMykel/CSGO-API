import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { getImageUrl } from "../constants.js";

export const getBaseWeapons = () => {
    const { folder } = languageData;

    const baseWeapons = [
        {
            "id": "base_weapon-ct_gloves",
            "name": $t(`csgo_wearable_ct_defaultgloves`),
            "description": $t(`csgo_wearable_ct_defaultgloves_desc`),
            "image": getImageUrl(`econ/weapons/base_weapons/ct_gloves`)
        },
        {
            "id": "base_weapon-t_gloves",
            "name": $t(`csgo_wearable_t_defaultgloves`),
            "description": $t(`csgo_wearable_t_defaultgloves_desc`),
            "image": getImageUrl(`econ/weapons/base_weapons/t_gloves`)
        },
        {
            "id": "base_weapon-weapon_ak47",
            "name": $t(`sfui_wpnhud_ak47`),
            "description": $t(`csgo_item_desc_ak47`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_ak47`)
        },
        {
            "id": "base_weapon-weapon_aug",
            "name": $t(`sfui_wpnhud_aug`),
            "description": $t(`csgo_item_desc_aug`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_aug`)
        },
        {
            "id": "base_weapon-weapon_awp",
            "name": $t(`sfui_wpnhud_awp`),
            "description": $t(`csgo_item_desc_awp`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_awp`)
        },
        {
            "id": "base_weapon-weapon_bayonet",
            "name": $t(`sfui_wpnhud_knifebayonet`),
            "description": $t(`csgo_item_desc_knife_bayonet`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_bayonet`)
        },
        {
            "id": "base_weapon-weapon_bizon",
            "name": $t(`sfui_wpnhud_bizon`),
            "description": $t(`csgo_item_desc_bizon`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_bizon`)
        },
        {
            "id": "base_weapon-weapon_c4",
            "name": $t(`sfui_wpnhud_c4`),
            "description": $t(`csgo_item_desc_c4`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_c4`)
        },
        {
            "id": "base_weapon-weapon_cz75a",
            "name": $t(`sfui_wpnhud_cz75`),
            "description": $t(`csgo_item_desc_cz75a`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_cz75a`)
        },
        {
            "id": "base_weapon-weapon_deagle",
            "name": $t(`sfui_wpnhud_deagle`),
            "description": $t(`csgo_item_desc_deserteagle`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_deagle`)
        },
        {
            "id": "base_weapon-weapon_decoy",
            "name": $t(`sfui_wpnhud_decoy`),
            "description": $t(`csgo_item_desc_decoy`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_decoy`)
        },
        {
            "id": "base_weapon-weapon_elite",
            "name": $t(`sfui_wpnhud_elite`),
            "description": $t(`csgo_item_desc_elites`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_elite`)
        },
        {
            "id": "base_weapon-weapon_famas",
            "name": $t(`sfui_wpnhud_famas`),
            "description": $t(`csgo_item_desc_famas`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_famas`)
        },
        {
            "id": "base_weapon-weapon_fiveseven",
            "name": $t(`sfui_wpnhud_fiveseven`),
            "description": $t(`csgo_item_desc_fiveseven`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_fiveseven`)
        },
        {
            "id": "base_weapon-weapon_flashbang",
            "name": $t(`sfui_wpnhud_flashbang`),
            "description": $t(`csgo_item_desc_flashbang`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_flashbang`)
        },
        {
            "id": "base_weapon-weapon_g3sg1",
            "name": $t(`sfui_wpnhud_g3sg1`),
            "description": $t(`csgo_item_desc_g3sg1`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_g3sg1`)
        },
        {
            "id": "base_weapon-weapon_galilar",
            "name": $t(`sfui_wpnhud_galilar`),
            "description": $t(`csgo_item_desc_galilar`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_galilar`)
        },
        {
            "id": "base_weapon-weapon_glock",
            "name": $t(`sfui_wpnhud_glock18`),
            "description": $t(`csgo_item_desc_glock18`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_glock`)
        },
        {
            "id": "base_weapon-weapon_healthshot",
            "name": $t(`sfui_wpnhud_healthshot`),
            "description": $t(`csgo_item_desc_healthshot`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_healthshot`)
        },
        {
            "id": "base_weapon-weapon_hegrenade",
            "name": $t(`sfui_wpnhud_hegrenade`),
            "description": $t(`csgo_item_desc_hegrenade`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_hegrenade`)
        },
        {
            "id": "base_weapon-weapon_hkp2000",
            "name": $t(`sfui_wpnhud_hkp2000`),
            "description": $t(`csgo_item_desc_hkp2000`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_hkp2000`)
        },
        {
            "id": "base_weapon-weapon_incgrenade",
            "name": $t(`sfui_wpnhud_incgrenade`),
            "description": $t(`csgo_item_desc_incgrenade`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_incgrenade`)
        },
        {
            "id": "base_weapon-weapon_knife_butterfly",
            "name": $t(`sfui_wpnhud_knife_butterfly`),
            "description": $t(`csgo_item_desc_knife_butterfly`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_butterfly`)
        },
        {
            "id": "base_weapon-weapon_knife_canis",
            "name": $t(`sfui_wpnhud_knife_canis`),
            "description": $t(`csgo_item_desc_knife_canis`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_canis`)
        },
        {
            "id": "base_weapon-weapon_knife_cord",
            "name": $t(`sfui_wpnhud_knife_cord`),
            "description": $t(`csgo_item_desc_knife_cord`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_cord`)
        },
        {
            "id": "base_weapon-weapon_knife_css",
            "name": $t(`sfui_wpnhud_knifecss`),
            "description": $t(`csgo_item_desc_knife_css`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_css`)
        },
        {
            "id": "base_weapon-weapon_knife_falchion",
            "name": $t(`sfui_wpnhud_knife_falchion_advanced`),
            "description": $t(`csgo_item_desc_knife_falchion_advanced`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_falchion`)
        },
        {
            "id": "base_weapon-weapon_knife_flip",
            "name": $t(`sfui_wpnhud_knifeflip`),
            "description": $t(`csgo_item_desc_knifeflip`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_flip`)
        },
        {
            "id": "base_weapon-weapon_knife_gut",
            "name": $t(`sfui_wpnhud_knifegut`),
            "description": $t(`csgo_item_desc_knifegut`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_gut`)
        },
        {
            "id": "base_weapon-weapon_knife_gypsy_jackknife",
            "name": $t(`sfui_wpnhud_knife_gypsy_jackknife`),
            "description": $t(`csgo_item_desc_knife_gypsy_jackknife`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_gypsy_jackknife`)
        },
        {
            "id": "base_weapon-weapon_knife_karambit",
            "name": $t(`sfui_wpnhud_knifekaram`),
            "description": $t(`csgo_item_desc_knife_karam`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_karambit`)
        },
        {
            "id": "base_weapon-weapon_knife_kukri",
            "name": $t(`sfui_wpnhud_knife_kukri`),
            "description": $t(`csgo_item_desc_knife_kukri`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_kukri`)
        },
        {
            "id": "base_weapon-weapon_knife_m9_bayonet",
            "name": $t(`sfui_wpnhud_knifem9`),
            "description": $t(`csgo_item_desc_knifem9`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_m9_bayonet`)
        },
        {
            "id": "base_weapon-weapon_knife_outdoor",
            "name": $t(`sfui_wpnhud_knife_outdoor`),
            "description": $t(`csgo_item_desc_knife_outdoor`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_outdoor`)
        },
        {
            "id": "base_weapon-weapon_knife",
            "name": $t(`sfui_wpnhud_knife`),
            "description": $t(`csgo_item_desc_knife`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife`)
        },
        {
            "id": "base_weapon-weapon_knife_push",
            "name": $t(`sfui_wpnhud_knife_push`),
            "description": $t(`csgo_item_desc_knife_push`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_push`)
        },
        {
            "id": "base_weapon-weapon_knife_skeleton",
            "name": $t(`sfui_wpnhud_knife_skeleton`),
            "description": $t(`csgo_item_desc_knife_skeleton`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_skeleton`)
        },
        {
            "id": "base_weapon-weapon_knife_stiletto",
            "name": $t(`sfui_wpnhud_knife_stiletto`),
            "description": $t(`csgo_item_desc_knife_stiletto`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_stiletto`)
        },
        {
            "id": "base_weapon-weapon_knife_survival_bowie",
            "name": $t(`sfui_wpnhud_knife_survival_bowie`),
            "description": $t(`csgo_item_desc_knife_survival_bowie`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_survival_bowie`)
        },
        {
            "id": "base_weapon-weapon_knife_t",
            "name": $t(`sfui_wpnhud_knife_t`),
            "description": $t(`csgo_item_desc_knife_t`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_t`)
        },
        {
            "id": "base_weapon-weapon_knife_tactical",
            "name": $t(`sfui_wpnhud_knifetactical`),
            "description": $t(`csgo_item_desc_knifetactical`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_tactical`)
        },
        {
            "id": "base_weapon-weapon_knife_ursus",
            "name": $t(`sfui_wpnhud_knife_ursus`),
            "description": $t(`csgo_item_desc_knife_ursus`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_ursus`)
        },
        {
            "id": "base_weapon-weapon_knife_widowmaker",
            "name": $t(`sfui_wpnhud_knife_widowmaker`),
            "description": $t(`csgo_item_desc_knife_widowmaker`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_knife_widowmaker`)
        },
        {
            "id": "base_weapon-weapon_m249",
            "name": $t(`sfui_wpnhud_m249`),
            "description": $t(`csgo_item_desc_m249`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_m249`)
        },
        {
            "id": "base_weapon-weapon_m4a1",
            "name": $t(`sfui_wpnhud_m4a1`),
            "description": $t(`csgo_item_desc_m4a4`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_m4a1`)
        },
        {
            "id": "base_weapon-weapon_m4a1_silencer",
            "name": $t(`sfui_wpnhud_m4a1_silencer`),
            "description": $t(`csgo_item_desc_m4a1_silencer`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_m4a1_silencer`)
        },
        {
            "id": "base_weapon-weapon_mac10",
            "name": $t(`sfui_wpnhud_mac10`),
            "description": $t(`csgo_item_desc_mac10`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_mac10`)
        },
        {
            "id": "base_weapon-weapon_mag7",
            "name": $t(`sfui_wpnhud_mag7`),
            "description": $t(`csgo_item_desc_mag7`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_mag7`)
        },
        {
            "id": "base_weapon-weapon_molotov",
            "name": $t(`sfui_wpnhud_molotov`),
            "description": $t(`csgo_item_desc_molotov`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_molotov`)
        },
        {
            "id": "base_weapon-weapon_mp5sd",
            "name": $t(`sfui_wpnhud_mp5sd`),
            "description": $t(`csgo_item_desc_mp5sd`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_mp5sd`)
        },
        {
            "id": "base_weapon-weapon_mp7",
            "name": $t(`sfui_wpnhud_mp7`),
            "description": $t(`csgo_item_desc_mp7`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_mp7`)
        },
        {
            "id": "base_weapon-weapon_mp9",
            "name": $t(`sfui_wpnhud_mp9`),
            "description": $t(`csgo_item_desc_mp9`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_mp9`)
        },
        {
            "id": "base_weapon-weapon_negev",
            "name": $t(`sfui_wpnhud_negev`),
            "description": $t(`csgo_item_desc_negev`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_negev`)
        },
        {
            "id": "base_weapon-weapon_nova",
            "name": $t(`sfui_wpnhud_nova`),
            "description": $t(`csgo_item_desc_nova`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_nova`)
        },
        {
            "id": "base_weapon-weapon_p250",
            "name": $t(`sfui_wpnhud_p250`),
            "description": $t(`csgo_item_desc_p250`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_p250`)
        },
        {
            "id": "base_weapon-weapon_p90",
            "name": $t(`sfui_wpnhud_p90`),
            "description": $t(`csgo_item_desc_p90`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_p90`)
        },
        {
            "id": "base_weapon-weapon_revolver",
            "name": $t(`sfui_wpnhud_revolver`),
            "description": $t(`csgo_item_desc_revolver`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_revolver`)
        },
        {
            "id": "base_weapon-weapon_sawedoff",
            "name": $t(`sfui_wpnhud_sawedoff`),
            "description": $t(`csgo_item_desc_sawedoff`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_sawedoff`)
        },
        {
            "id": "base_weapon-weapon_scar20",
            "name": $t(`sfui_wpnhud_scar20`),
            "description": $t(`csgo_item_desc_scar20`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_scar20`)
        },
        {
            "id": "base_weapon-weapon_sg556",
            "name": $t(`sfui_wpnhud_sg556`),
            "description": $t(`csgo_item_desc_sg553`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_sg556`)
        },
        {
            "id": "base_weapon-weapon_smokegrenade",
            "name": $t(`sfui_wpnhud_smokegrenade`),
            "description": $t(`csgo_item_desc_smokegrenade`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_smokegrenade`)
        },
        {
            "id": "base_weapon-weapon_ssg08",
            "name": $t(`sfui_wpnhud_ssg08`),
            "description": $t(`csgo_item_desc_ssg08`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_ssg08`)
        },
        {
            "id": "base_weapon-weapon_taser",
            "name": $t(`sfui_wpnhud_taser`),
            "description": $t(`csgo_item_desc_taser`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_taser`)
        },
        {
            "id": "base_weapon-weapon_tec9",
            "name": $t(`sfui_wpnhud_tec9`),
            "description": $t(`csgo_item_desc_tec9`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_tec9`)
        },
        {
            "id": "base_weapon-weapon_ump45",
            "name": $t(`sfui_wpnhud_ump45`),
            "description": $t(`csgo_item_desc_ump45`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_ump45`)
        },
        {
            "id": "base_weapon-weapon_usp_silencer",
            "name": $t(`sfui_wpnhud_usp_silencer`),
            "description": $t(`csgo_item_desc_usp_silencer`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_usp_silencer`)
        },
        {
            "id": "base_weapon-weapon_xm1014",
            "name": $t(`sfui_wpnhud_xm1014`),
            "description": $t(`csgo_item_desc_xm1014`),
            "image": getImageUrl(`econ/weapons/base_weapons/weapon_xm1014`)
        }
    ]

    saveDataJson(`./public/api/${folder}/base_weapons.json`, baseWeapons);
};
