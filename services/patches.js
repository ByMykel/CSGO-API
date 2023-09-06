import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

const isPatch = (item) => !(item.patch_material === undefined);

const parseItem = (item) => {
    const image = cdn[`econ/patches/${item.patch_material}_large`];

    return {
        id: `patch-${item.object_id}`,
        name: `${$t("csgo_tool_patch")} | ${$t(item.item_name)}`,
        name_original: item.name,
        description: $t(item.description_string),
        rarity: $t(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getPatches = () => {
    const { stickerKits } = state;
    const { folder } = languageData;

    const patches = stickerKits.filter(isPatch).map(parseItem);

    saveDataJson(`./public/api/${folder}/patches.json`, patches);
};
