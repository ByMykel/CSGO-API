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

    if (!item.item_name.startsWith("#StickerKit_")) {
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
    let msg = $t("CSGO_Tool_Sticker_Desc");
    let desc = $t(item.description_string);
    if (desc && desc.length > 0 && item.description_string !== `#${desc}`) {
        msg = `${msg}<br><br>${desc}`;
    }
    return msg;
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
    const events = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const eventsTeamNotMarketable = [14, 15, 16];

    if ([1].includes(item.tournament_event_id)) {
        return null;
    }

    // Team logos were not marketable. But players marketable.
    if (
        eventsTeamNotMarketable.includes(item.tournament_event_id) &&
        item.item_rarity === "legendary" &&
        item.tournament_player_id == null
    ) {
        return null;
    }

    // Marketable both teams and players.
    if (
        events.includes(item.tournament_event_id) &&
        item.item_rarity === "legendary"
    ) {
        return null;
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
