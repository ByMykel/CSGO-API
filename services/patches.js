import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const isPatch = (item) => {
    if (
        ["case_skillgroups/patch_legendaryeagle"].includes(item.patch_material)
    ) {
        return false;
    }

    return !(item.patch_material === undefined);
};

const getDescription = (item) => {
    let msg = $t("CSGO_Tool_Patch_Desc");
    let desc = $t(item.description_string);
    if (desc && desc.length > 0) {
        msg = `${msg}<br><br>${desc}`;
    }
    return msg;
};

const parseItem = (item) => {
    const image = getImageUrl(`econ/patches/${item.patch_material}`);

    return {
        id: `patch-${item.object_id}`,
        name: `${$t("csgo_tool_patch")} | ${$t(item.item_name)}`,
        description: getDescription(item),
        rarity: {
            id: `rarity_${item.item_rarity}`,
            name: $t(`rarity_${item.item_rarity}`),
            color: getRarityColor(`rarity_${item.item_rarity}`),
        },
        market_hash_name: `${$t("csgo_tool_patch", true)} | ${$t(
            item.item_name,
            true
        )}`,
        image,
    };
};

export const getPatches = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const patches = stickerKits.filter(isPatch).map(parseItem);

    saveDataJson(`./public/api/${folder}/patches.json`, patches);
};
