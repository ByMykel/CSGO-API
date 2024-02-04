import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import { getRarityColor } from "../utils/index.js";

const isPatch = (item) => {
    if (
        ["case_skillgroups/patch_legendaryeagle"].includes(item.patch_material)
    ) {
        return false;
    }

    return !(item.patch_material === undefined);
};

const getDescription = (item) => {
    let msg = $t("CSGO_Tool_Patch_Desc")
    let desc = $t(item.description_string);
    if (desc && desc.length > 0) {
        msg = `${msg}<br><br>${desc}`;
    }
    return msg;
};

const parseItem = (item) => {
    const image = cdn[`econ/patches/${item.patch_material}_large`];

    return {
        id: `patch-${item.object_id}`,
        name: `${$t("csgo_tool_patch")} | ${$t(item.item_name)}`,
        description: getDescription(item),
        rarity: {
            id: `rarity_${item.item_rarity}`,
            name: $t(`rarity_${item.item_rarity}`),
            color: getRarityColor(`rarity_${item.item_rarity}`),
        },
        image,
    };
};

export const getPatches = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const patches = stickerKits.filter(isPatch).map(parseItem);

    saveDataJson(`./public/api/${folder}/patches.json`, patches);
};
