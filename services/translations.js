import * as VDF from "vdf-parser";
import axios from "axios";

export const getTranslation = (translations, key) => {
    const translation =
        translations.selected[key?.replace("#", "").toLowerCase()];
    const defaultTranslation =
        translations.default[key?.replace("#", "").toLowerCase()];

    return translation || defaultTranslation || null;
};

export const getTranslations = async (url) => {
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
