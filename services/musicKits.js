import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };
import { isExclusive } from "../utils/weapon.js";

const parseItem = (item) => {
    const image = cdn[`${item.image_inventory.toLowerCase()}`];
    const exclusive = isExclusive(item.name);

    return {
        id: `music_kit-${item.object_id}`,
        name: exclusive ? $t(item.loc_name) : $t(item.coupon_name),
        description: $t(item.loc_description),
        rarity: $t("rarity_rare"),
        exclusive,
        image,
    };
};

export const getMusicKits = () => {
    const { musicDefinitions } = state;
    const { folder } = languageData;

    const musicKits = musicDefinitions.map(parseItem);

    saveDataJson(`./public/api/${folder}/music_kits.json`, musicKits);
};
