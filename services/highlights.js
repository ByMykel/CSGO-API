import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { state } from "./main.js";

const parseItem = (item) => {
    const [tournament, highlightType] = item.id.split('_');
    const keychainName = $t(`keychain_kc_${tournament}`);
    const highlightName = $t(`highlightreel_${tournament}_${highlightType}`);
    const keychainNameRaw = $t(`keychain_kc_${tournament}`, true);
    const highlightNameRaw = $t(`highlightreel_${tournament}_${highlightType}`, true);
    
    return {
        id: item.id,
        // TODO: translate Souvenir Charm to other languages
        name: `Souvenir Charm | ${keychainName} | ${highlightName}`,
        description: $t(`highlightdesc_${tournament}_${highlightType}`),
        tournament_event:
        $t(`csgo_watch_cat_tournament_${item.tournament_event_id}`) ??
        $t(`csgo_tournament_event_location_${item.tournament_event_id}`) ??
        undefined,
        team0: $t(`csgo_teamid_${item.tournament_event_team0_id}`),
        team1: $t(`csgo_teamid_${item.tournament_event_team1_id}`),
        stage: $t(`csgo_tournament_event_stage_${item.tournament_event_stage_id}`),
        map: item.tournament_event_map,
        market_hash_name: `Souvenir Charm | ${keychainNameRaw} | ${highlightNameRaw}`,
        image: item.image,
        video: item.video,
    };
};

export const getHighlights = () => {
    const { highlightReels } = state;
    const { folder } = languageData;

    const highlights = highlightReels.map(parseItem);

    saveDataJson(`./public/api/${folder}/highlights.json`, highlights);
};
