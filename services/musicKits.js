import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor, isExclusive } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const parseItem = (item) => {
    const image = getImageUrl(item.image_inventory.toLowerCase());
    const exclusive = isExclusive(item.name);

    const normalMusicKit = {
        id: `music_kit-${item.object_id}`,
        name: exclusive ? $t(item.loc_name) : $t(item.coupon_name),
        description: $t(item.loc_description),
        rarity: {
            id: "rarity_rare",
            name: $t("rarity_rare"),
            color: getRarityColor(`rarity_rare`),
        },
        exclusive,
        image,
    };

    if ($t(`${item.coupon_name}_stattrak`)) {
        const stattrakMusicKit = {
            id: `music_kit-${item.object_id}_st`,
            name: $t(`${item.coupon_name}_stattrak`),
            description: $t(item.loc_description),
            rarity: {
                id: "rarity_rare",
                name: $t("rarity_rare"),
                color: getRarityColor(`rarity_rare`),
            },
            exclusive: false,
            image,
        };

        return [normalMusicKit, stattrakMusicKit];
    }

    return [normalMusicKit];
};

export const getMusicKits = () => {
    const { musicDefinitions } = state;
    const { folder } = languageData;

    const musicKits = musicDefinitions
        .map(parseItem)
        .reduce((acc, kits) => acc.concat(kits), []);

    saveDataJson(`./public/api/${folder}/music_kits.json`, musicKits);
};
