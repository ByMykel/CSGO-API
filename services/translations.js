import axios from "axios";
import { CSGO_ENGLISH_URL } from "../constants.js";
import customTranslations from "../utils/translations.json" with { type: "json" };

export let languageData = null;
const translations = {
    default: null,
    default_idx: [],
    selected: null,
    selected_idx: [],
};

export const $t = (key, useDefault = false) => {
    key = key?.replace("#", "").toLowerCase();

    if (useDefault) {
        return translations.default[key] || null;
    }

    return translations.selected[key] || translations.default[key] || null;
};

export const $tTag = (key, useDefault = false) => {
    key = key?.replace("#", "").toLowerCase();
    const target = useDefault ? translations.default : translations.selected;
    const targetIdx = useDefault ? translations.default_idx : translations.selected_idx;
    const search = targetIdx.indexOf(key);
    if (search !== -1) {
        for (let i = search; i >= 0; i--) {
            if (!targetIdx[i].toLowerCase().includes("_tag")) {
                return target[targetIdx[i]];
            }
        }
    }
    return null;
};

export const $tc = (key, data = {}) => {
    const all = customTranslations?.[languageData.folder];

    if (!all) {
        throw new Error(`translations for '${languageData.folder}' not found`);
    }

    const specific = all[key];

    if (!specific) {
        throw new Error(
            `key '${key}' does not exist in '${languageData.language}' translations`
        );
    }

    let replaced = specific.replace(/\{.*?\}/g, function (match) {
        const key = match.replace("{", "").replace("}", "");

        if (!(key in data)) {
            throw new Error(`$tc data key {${key}} not provided`);
        }

        return data[key];
    });

    return replaced;
};

const getTranslations = async (url) => {
    const { data } = await axios.get(url);

    const lowerCaseKeys = Object.fromEntries(
        Object.entries(data.lang.Tokens).map(([key, val]) => [
            key.toLowerCase(),
            val,
        ])
    );

    const lowerCaseKeysIdx = [];
    for (const key in lowerCaseKeys) {
        lowerCaseKeysIdx.push(key);
    }

    return {lowerCaseKeys, lowerCaseKeysIdx};
};

export const loadTranslations = async ({ language, url, folder }) => {
    if (translations.default == null) {
        await getTranslations(CSGO_ENGLISH_URL)
            .then((data) => {
                translations.default = data.lowerCaseKeys;
                translations.default_idx = data.lowerCaseKeysIdx;
            })
            .catch(() => {
                throw new Error(
                    `Error loading translations from ${CSGO_ENGLISH_URL}`
                );
            });
    }

    await getTranslations(url)
        .then((data) => {
            languageData = { language, folder };
            translations.selected = data.lowerCaseKeys;
            translations.selected_idx = data.lowerCaseKeysIdx;
        })
        .catch(() => {
            throw new Error(`Error loading translations from ${url}`);
        });
};
