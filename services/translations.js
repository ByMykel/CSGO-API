import * as VDF from "vdf-parser";
import axios from "axios";
import { CSGO_ENGLISH_URL } from "../utils/config.js";

export const getTranslation = (translations, key) => {
    const translation = translations[key?.replace("#", "").toLowerCase()];

    if (translation === undefined || translation === "") return null;

    return translation;
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
