import { IMAGES_BASE_URL } from "../utils/config.js";
import { saveDataJson } from "./saveDataJson.js";
import { $translate, languageData } from "./translations.js";
import { state } from "./main.js";
import { saveDataMemory } from "./saveDataMemory.js";

const isPatch = (item) => !(item.patch_material === undefined);

const parseItem = (item) => {
    const image = `${IMAGES_BASE_URL}econ/patches/${item.patch_material}_large.png`;

    return {
        id: `patch-${item.object_id}`,
        name: `Patch | ${$translate(item.item_name)}`,
        description: $translate(item.description_string),
        rarity: $translate(`rarity_${item.item_rarity}`),
        image,
    };
};

export const getPatches = () => {
    const { stickerKits } = state;

    const patches = [];

    stickerKits.forEach((item) => {
        if (isPatch(item)) patches.push(parseItem(item));
    });

    saveDataMemory(languageData.language, patches);
    saveDataJson(`./public/api/${languageData.folder}/patches.json`, patches);
};
