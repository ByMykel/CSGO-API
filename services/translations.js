import * as VDF from "vdf-parser";
import axios from "axios";
import { CSGO_ENGLISH_URL } from "../utils/config.js";

export let languageData = null;
const translations = {
    default: null,
    selected: null,
};

const getTranslations = async (url) => {
    const { data } = await axios.get(url);

    const parsed = VDF.parse(data);

    const lowerCaseKeys = Object.fromEntries(
        Object.entries(parsed.lang.Tokens).map(([key, val]) => [
            key.toLowerCase(),
            val,
        ])
    );

    return lowerCaseKeys;
};

export const $translate = (key) => {
    key = key?.replace("#", "").toLowerCase();

    return translations.selected[key] || translations.default[key] || null;
};

export const loadTranslations = async ({ language, url, folder }) => {
    if (translations.default == null) {
        await getTranslations(CSGO_ENGLISH_URL).then((data) => {
            translations.default = data;
        });
    }

    await getTranslations(url)
        .then((data) => {
            languageData = { language, folder };
            translations.selected = data;
        })
        .catch(() => {
            throw new Error(`Error loading translations from ${url}`);
        });
};
