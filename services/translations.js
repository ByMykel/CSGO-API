import * as VDF from "vdf-parser";
import axios from "axios";
import { CSGO_ENGLISH_URL } from "../constants.js";
import customTranslations from "../utils/translations.json" assert { type: "json" };

export let languageData = null;
const translations = {
    default: null,
    selected: null,
};

export const $t = (key) => {
    key = key?.replace("#", "").toLowerCase();

    return translations.selected[key] || translations.default[key] || null;
};

export const $tc = (key, data = {}) => {
    const all = customTranslations?.[languageData.folder];

    if (!all) {
        throw new Error(`translations for '${languageData.folder}' not found`);
    }

    const specific = all[key]

    if (!specific) {
        throw new Error(`key '${key}' does not exist in '${languageData.language}' translations`);
    }

    let replaced = specific.replace(/\{.*?\}/g, function (match) {
        const key = match.replace("{", "").replace("}", "")

        if (!(key in data)) {
            throw new Error(`$tc data key {${key}} not provided`);
        }

        return data[key];
    });

    return replaced;
}

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
