import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isSticker = (item) => {
    if (item.sticker_material === undefined) {
        return false;
    }

    if (!item.item_name.toLowerCase().includes("stickerkit_")) {
        return false;
    }

    if (item.name.includes("graffiti")) {
        return false;
    }

    if (item.name.includes("spray_")) {
        return false;
    }

    return true;
};

const getDescription = (item) => {
    const commemoratesText = item.tournament_event_id ? `<span style='color:#ffd700;'>${$t(`csgo_event_desc`).replace('%s1', $t(`csgo_tournament_event_name_${item.tournament_event_id}`))}</span><br/><br/> ` : '';
    
    let msg = $t("CSGO_Tool_Sticker_Desc");
    let desc = $t(item.description_string);
    if (desc && desc.length > 0 && item.description_string !== `#${desc}`) {
        return `${commemoratesText}${msg}<br><br>${desc}`;
    }
    return `${commemoratesText}${msg}`;
};

const getType = (item) => {
    if (item.tournament_player_id) {
        return "Autograph";
    }

    if (item.tournament_team_id) {
        return "Team";
    }

    if (item.tournament_event_id) {
        return "Event";
    }

    return "Other";
};

const getEffect = (item) => {
    if (
        $t(item.item_name, true).includes("(Holo)") ||
        $t(item.item_name, true).includes("(Holo, ")
    ) {
        return "Holo";
    }

    if ($t(item.item_name, true).includes("(Foil)")) {
        return "Foil";
    }

    if ($t(item.item_name, true).includes("(Lenticular)")) {
        return "Lenticular";
    }

    if (
        $t(item.item_name, true).includes("(Glitter)") ||
        $t(item.item_name, true).includes("(Glitter, ")
    ) {
        return "Glitter";
    }

    if (
        $t(item.item_name, true).includes("(Gold)") ||
        $t(item.item_name, true).includes("(Gold, ")
    ) {
        return "Gold";
    }

    return "Other";
};

const getMarketHashName = (item) => {
    // 1 - DreamHack 2013
    if (item.tournament_event_id === 1) {
        return null;
    }

    // 3 - Katowice 2014
    if (item.tournament_event_id === 3) {
        if (
            (getType(item) === "Event" &&
                item.sticker_material.includes("gold_foil")) ||
            (getEffect(item) === "Foil" && getType(item) === "Team")
        ) {
            return null;
        }
    }

    // 4 - Cologne 2014
    if (item.tournament_event_id === 4) {
        if (
            getEffect(item) === "Foil" ||
            item.sticker_material === "cologne2014/esl_c"
        ) {
            return null;
        }
    }

    // 5 - DreamHack 2014,
    // 6 - Katowice 2015,
    // 7 - Cologne 2015,
    // 8 - Cluj-Napoca 2015
    // 9 - Columbus 2016
    // 10 - Cologne 2016
    // 11 - Atlanta 2017
    // 12 - Krakow 2017
    // 13 - Boston 2018
    // 14 - London 2018
    // 15 - Katowice 2019
    // 16 - Berlin 2019
    if (
        [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].includes(
            item.tournament_event_id
        )
    ) {
        if (item.item_rarity === "legendary" && getEffect(item) === "Gold") {
            return null;
        }
    }

    if (
        item.sticker_material.startsWith("tournament_assets/") ||
        item.sticker_material.startsWith("danger_zone/")
    ) {
        return null;
    }

    return `${$t("csgo_tool_sticker", true)} | ${$t(item.item_name, true)}`;
};

const parseItem = (item) => {
    const { cratesBySkins } = state;

    const image = getImageUrl(
        `econ/stickers/${item.sticker_material.toLowerCase()}`
    );

    // items_game.txt is named as dignitas but in translation as teamdignitas.
    if (item.item_name === "#StickerKit_dhw2014_dignitas_gold") {
        item.item_name = "#StickerKit_dhw2014_teamdignitas_gold";
    }

    return {
        id: `sticker-${item.object_id}`,
        name: `${$t("csgo_tool_sticker")} | ${$t(item.item_name)}`,
        description: getDescription(item),
        rarity: item.item_rarity
            ? {
                id: `rarity_${item.item_rarity}`,
                name: $t(`rarity_${item.item_rarity}`),
                color: getRarityColor(`rarity_${item.item_rarity}`),
            }
            : {
                id: "rarity_default",
                name: $t("rarity_default"),
                color: getRarityColor("rarity_default"),
            },
        special_notes: specialNotes?.[`sticker-${item.object_id}`],
        crates:
            cratesBySkins?.[`sticker-${item.object_id}`]?.map((i) => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        tournament_event:
            $t(`csgo_watch_cat_tournament_${item.tournament_event_id}`) ??
            $t(`csgo_tournament_event_location_${item.tournament_event_id}`) ??
            undefined,
        tournament_team:
            $t(`csgo_teamid_${item.tournament_team_id}`) ?? undefined,
        tournament_player:
            state.players[item.tournament_player_id] ?? undefined,
        type: getType(item),
        market_hash_name: getMarketHashName(item),
        effect: getEffect(item),
        image,
    };
};

export const getStickers = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const stickers = stickerKits.filter(isSticker).map(parseItem);

    saveDataJson(`./public/api/${folder}/stickers.json`, stickers);
};
