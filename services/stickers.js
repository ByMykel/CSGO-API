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
        image,
    };
};

export const getStickers = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const stickers = stickerKits.filter(isSticker).map(parseItem);

    saveDataJson(`./public/api/${folder}/stickers.json`, stickers);
};
