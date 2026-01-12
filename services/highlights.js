import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, $tc, languageData } from "./translations.js";
import { state } from "./main.js";

const parseItem = item => {
    const { cdnImages } = state;
    const { folder } = languageData;
    const [tournament, highlightType] = item.id.split("_");
    const keychainName = $t(`keychain_kc_${tournament}`);
    const highlightName = $t(`highlightreel_${tournament}_${highlightType}`);
    const keychainNameRaw = $t(`keychain_kc_${tournament}`, true);
    const highlightNameRaw = $t(`highlightreel_${tournament}_${highlightType}`, true);
    const charmName = $t("CSGO_Tool_Keychain");

    const getThumbnail = () => {
        // Only Austin 2025 has chinese thumbnail
        if (![24].includes(item.tournament_event_id)) {
            return item.thumbnail;
        }

        return folder === "zh-CN" ? item.thumbnail.replace("/ww/", "/cn/") : item.thumbnail;
    };

    return {
        id: `highlight-${item.highlight_reel}`,
        def_index: item.highlight_reel,
        name: $tc("highlight_charm", {
            charm_name: charmName,
            keychain_name: keychainName,
            highlight_name: highlightName,
        }),
        description: $t(`highlightdesc_${tournament}_${highlightType}`),
        tournament_event:
            $t(`csgo_watch_cat_tournament_${item.tournament_event_id}`) ??
            $t(`csgo_tournament_event_location_${item.tournament_event_id}`) ??
            undefined,
        team0: $t(`csgo_teamid_${item.tournament_event_team0_id}`),
        team1: $t(`csgo_teamid_${item.tournament_event_team1_id}`),
        stage: $t(`csgo_tournament_event_stage_${item.tournament_event_stage_id}`),
        tournament_player: item.tournament_player,
        map: item.tournament_event_map,
        market_hash_name: `Souvenir Charm | ${keychainNameRaw} | ${highlightNameRaw}`,
        image: cdnImages[item.image_inventory] ?? item.image,
        video: folder === "zh-CN" ? item.video.replace("_ww_", "_cn_") : item.video,
        // TODO: would be great to have chinese thumbnail as well
        thumbnail: getThumbnail(),
        original: {
            id: item.id,
            image_inventory: item.image_inventory,
        },
    };
};

export const getHighlights = () => {
    const { highlightReels } = state;
    const { folder } = languageData;

    const highlights = highlightReels.map(parseItem);

    saveDataJson(`./public/api/${folder}/highlights.json`, highlights);
};
