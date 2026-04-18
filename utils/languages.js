import { LANGUAGES_URL } from "../constants.js";

export const getLanguages = codes => {
    if (codes.some(c => c.toLowerCase() === "all")) return LANGUAGES_URL;
    return LANGUAGES_URL.filter(l => codes.includes(l.folder));
};

export const parseLanguagesArg = args => {
    const langIndex = args.indexOf("--languages");
    const next = args[langIndex + 1];

    if (langIndex === -1 || !next || next.startsWith("--")) {
        return [];
    }

    return next
        .split(",")
        .map(l => l.trim())
        .filter(Boolean);
};
