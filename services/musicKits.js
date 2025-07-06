import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";
import { getRarityColor, isExclusive } from "../utils/index.js";
import { getImageUrl } from "../constants.js";

const parseItem = (item) => {
    const image = getImageUrl(item.image_inventory.toLowerCase());
    const exclusive = isExclusive(item.name);
    const valve = ["valve_01", "valve_02", "valve_cs2_01"].includes(item.name);

    // If I'm not mistaken, these are the same based on these pictures:
    // https://counterstrike.fandom.com/wiki/Music_Kit/Valve,_CS_GO
    if (item.name === "valve_02") {
        item.name = "valve_01";
        item.loc_name = "#musickit_valve_csgo_01";
        item.loc_description = "#musickit_valve_csgo_01_desc";
    }

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
            name: (exclusive || valve) ? $t(item.loc_name) : $t(item.coupon_name),
            description: $t(item.loc_description),
            rarity: {
                id: "rarity_rare",
                name: $t("rarity_rare"),
                color: getRarityColor(`rarity_rare`),
            },
            market_hash_name: (exclusive || valve) ? null : `Music Kit | ${$t(`musickit_${item.name}`, true)}`,
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
