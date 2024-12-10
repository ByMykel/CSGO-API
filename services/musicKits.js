import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor, isExclusive } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const parseItem = (item) => {
    const image = getImageUrl(item.image_inventory.toLowerCase());
    const exclusive = isExclusive(item.name);

    const kitsOnlyStattrak = [
        'beartooth_02',
        'blitzkids_01',
        'hundredth_01',
        'neckdeep_01',
        'roam_01',
        'twinatlantic_01',
        'skog_03'
    ]

    let kits = []

    if (!kitsOnlyStattrak.includes(item.name)) {
        const normalMusicKit = {
            id: `music_kit-${item.object_id}`,
            name: exclusive ? $t(item.loc_name) : $t(item.coupon_name),
            description: $t(item.loc_description),
            rarity: {
                id: "rarity_rare",
                name: $t("rarity_rare"),
                color: getRarityColor(`rarity_rare`),
            },
            market_hash_name: exclusive ? null : `Music Kit | ${$t(`musickit_${item.name}`, true)}`,
            exclusive,
            image,
        };

        kits.push(normalMusicKit)
    }

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
            market_hash_name: exclusive ? null : `StatTrak™ Music Kit | ${$t(`musickit_${item.name}`, true)}`,
            exclusive: false,
            image,
        };

        kits.push(stattrakMusicKit)
    }

    return kits;
};

export const getMusicKits = () => {
    const { musicDefinitions } = state;
    const { folder } = languageData;

    const musicKits = musicDefinitions
        .map(parseItem)
        .reduce((acc, kits) => acc.concat(kits), []);

    saveDataJson(`./public/api/${folder}/music_kits.json`, musicKits);
};
