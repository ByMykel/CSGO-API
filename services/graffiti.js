import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import specialNotes from "../utils/specialNotes.json" assert { type: "json" };
import { getGraffitiVariations, getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isGraffiti = (item) => {
    if (item.item_name.startsWith("#SprayKit_")) {
        return true;
    }

    if (item.name.includes("spray_")) {
        return true;
    }

    if (item.sticker_material?.includes("_graffiti")) {
        return true;
    }

    return false;
};

const getDescription = (item) => {
    let msg = $t("csgo_tool_spray_desc");
    let desc = $t(item.description_string);
    if (desc && desc.length > 0) {
        msg = `${msg}<br><br>${desc}`;
    }
    return msg;
};

const parseItemSealedGraffiti = (item) => {
    const { cratesBySkins } = state;
    const image = getImageUrl(`econ/stickers/${item.sticker_material}`);

    // TODO: work in progress
    const variations = getGraffitiVariations(item.name);
    const variationsIndex =
        variations[0] === 0
            ? Array.from({ length: 19 }, (_, index) => index + 1)
            : variations;

    if (variationsIndex.length > 0) {
        return variationsIndex.map((index) => {
            const colorKey = `attrib_spraytintvalue_${index}`;
            return {
                id: `graffiti-${item.object_id}_${index}`,
                name: `${$t("csgo_tool_spray")} | ${$t(item.item_name)} (${$t(
                    colorKey
                )})`,
                description: getDescription(item),
                rarity: {
                    id: `rarity_${item.item_rarity}`,
                    name: $t(`rarity_${item.item_rarity}`),
                    color: getRarityColor(`rarity_${item.item_rarity}`),
                },
                special_notes: specialNotes?.[`graffiti-${item.object_id}`],
                crates:
                    cratesBySkins?.[`graffiti-${item.object_id}`]?.map((i) => ({
                        ...i,
                        name: $t(i.name),
                    })) ?? [],
                market_hash_name: `${$t("csgo_tool_spray", true)} | ${$t(
                    item.item_name,
                    true
                )} (${$t(colorKey, true)})`,
                image: getImageUrl(
                    `econ/stickers/${item.sticker_material}_${index}`
                ),
            };
        });
    }

    return {
        id: `graffiti-${item.object_id}`,
        name: `${$t("csgo_tool_spray")} | ${$t(item.item_name)}`,
        description: getDescription(item),
        rarity: {
            id: `rarity_${item.item_rarity}`,
            name: $t(`rarity_${item.item_rarity}`),
            color: getRarityColor(`rarity_${item.item_rarity}`),
        },
        special_notes: specialNotes?.[`graffiti-${item.object_id}`],
        crates:
            cratesBySkins?.[`graffiti-${item.object_id}`]?.map((i) => ({
                ...i,
                name: $t(i.name),
            })) ?? [],
        market_hash_name: `${$t("csgo_tool_spray", true)} | ${$t(
            item.item_name,
            true
        )}`,
        image,
    };
};

export const getGraffiti = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const graffiti = stickerKits
        .filter(isGraffiti)
        .map(parseItemSealedGraffiti)
        .flatMap((level1) => level1);

    saveDataJson(`./public/api/${folder}/graffiti.json`, graffiti);
};
