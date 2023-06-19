export const weaponsNames = [
    "weapon_deagle",
    "weapon_elite",
    "weapon_fiveseven",
    "weapon_glock",
    "weapon_ak47",
    "weapon_aug",
    "weapon_awp",
    "weapon_famas",
    "weapon_g3sg1",
    "weapon_galilar",
    "weapon_m249",
    "weapon_mac10",
    "weapon_p90",
    "weapon_mp5sd",
    "weapon_ump45",
    "weapon_xm1014",
    "weapon_bizon",
    "weapon_mag7",
    "weapon_negev",
    "weapon_sawedoff",
    "weapon_tec9",
    "weapon_hkp2000",
    "weapon_mp7",
    "weapon_mp9",
    "weapon_nova",
    "weapon_p250",
    "weapon_scar20",
    "weapon_sg556",
    "weapon_ssg08",
    "weapon_m4a1_silencer",
    "weapon_m4a1",
    "weapon_usp_silencer",
    "weapon_cz75a",
    "weapon_revolver",
    "weapon_bayonet",
    "weapon_knife_css",
    "weapon_knife_flip",
    "weapon_knife_gut",
    "weapon_knife_karambit",
    "weapon_knife_m9_bayonet",
    "weapon_knife_tactical",
    "weapon_knife_falchion",
    "weapon_knife_survival_bowie",
    "weapon_knife_butterfly",
    "weapon_knife_push",
    "weapon_knife_cord",
    "weapon_knife_canis",
    "weapon_knife_ursus",
    "weapon_knife_gypsy_jackknife",
    "weapon_knife_outdoor",
    "weapon_knife_stiletto",
    "weapon_knife_widowmaker",
    "weapon_knife_skeleton",
    "studded_bloodhound_gloves",
    "studded_brokenfang_gloves",
    "sporty_gloves",
    "slick_gloves",
    "leather_handwraps",
    "motorcycle_gloves",
    "specialist_gloves",
    "studded_hydra_gloves",
];

export const knives = [
    {
        name: "weapon_bayonet",
        item_name: "sfui_wpnhud_knifebayonet",
        item_description: "csgo_item_desc_knife_bayonet",
    },
    {
        name: "weapon_knife_css",
        item_name: "sfui_wpnhud_knifecss",
        item_description: "csgo_item_desc_knife_css",
    },
    {
        name: "weapon_knife_flip",
        item_name: "sfui_wpnhud_knifeflip",
        item_description: "csgo_item_desc_knife_flip",
    },
    {
        name: "weapon_knife_gut",
        item_name: "sfui_wpnhud_knifegut",
        item_description: "csgo_item_desc_knife_gut",
    },
    {
        name: "weapon_knife_karambit",
        item_name: "sfui_wpnhud_knifekaram",
        item_description: "csgo_item_desc_knife_karam",
    },
    {
        name: "weapon_knife_m9_bayonet",
        item_name: "sfui_wpnhud_knifem9",
        item_description: "csgo_item_desc_knifem9",
    },
    {
        name: "weapon_knife_tactical",
        item_name: "sfui_wpnhud_knifetactical",
        item_description: "csgo_item_desc_knifetactical",
    },
    {
        name: "weapon_knife_falchion",
        item_name: "sfui_wpnhud_knife_falchion_advanced",
        item_description: "csgo_item_desc_knife_falchion_advanced",
    },
    {
        name: "weapon_knife_survival_bowie",
        item_name: "sfui_wpnhud_knife_survival_bowie",
        item_description: "csgo_item_desc_knife_survival_bowie",
    },
    {
        name: "weapon_knife_butterfly",
        item_name: "sfui_wpnhud_knife_butterfly",
        item_description: "csgo_item_desc_knife_butterfly",
    },
    {
        name: "weapon_knife_push",
        item_name: "sfui_wpnhud_knife_push",
        item_description: "csgo_item_desc_knife_push",
    },
    {
        name: "weapon_knife_cord",
        item_name: "sfui_wpnhud_knife_cord",
        item_description: "csgo_item_desc_knife_cord",
    },
    {
        name: "weapon_knife_canis",
        item_name: "sfui_wpnhud_knife_canis",
        item_description: "csgo_item_desc_knife_canis",
    },
    {
        name: "weapon_knife_ursus",
        item_name: "sfui_wpnhud_knife_ursus",
        item_description: "csgo_item_desc_knife_ursus",
    },
    {
        name: "weapon_knife_gypsy_jackknife",
        item_name: "sfui_wpnhud_knife_gypsy_jackknife",
        item_description: "csgo_item_desc_knife_gypsy_jackknife",
    },
    {
        name: "weapon_knife_outdoor",
        item_name: "sfui_wpnhud_knife_outdoor",
        item_description: "csgo_item_desc_knife_outdoor",
    },
    {
        name: "weapon_knife_stiletto",
        item_name: "sfui_wpnhud_knife_stiletto",
        item_description: "csgo_item_desc_knife_stiletto",
    },
    {
        name: "weapon_knife_widowmaker",
        item_name: "sfui_wpnhud_knife_widowmaker",
        item_description: "csgo_item_desc_knife_widowmaker",
    },
    {
        name: "weapon_knife_skeleton",
        item_name: "sfui_wpnhud_knife_skeleton",
        item_description: "csgo_item_desc_knife_skeleton",
    },
];

export const getWeaponName = (string) => {
    for (const weapon of weaponsNames) {
        if (string.includes(weapon)) {
            return weapon;
        }
    }

    return false;
};

export const isNotWeapon = (string) => {
    return (
        !string.includes("weapon_") ||
        string.includes("weapon_knife") ||
        string.includes("weapon_bayonet")
    );
};
