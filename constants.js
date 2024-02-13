const getLanguageUrl = (language) => {
    return `https://raw.githubusercontent.com/ByMykel/counter-strike-file-tracker/main/static/csgo_${language}.json`;
};

export const getImageUrl = (path) => {
    return `https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/${path}_png.png`;
};

export const ITEMS_GAME_URL =
    "https://raw.githubusercontent.com/ByMykel/counter-strike-file-tracker/main/static/items_game.json";

export const IMAGES_BASE_URL =
    "https://raw.githubusercontent.com/steamdatabase/gametracking-csgo/108f1682bf7eeb1420caaf2357da88b614a7e1b0/csgo/pak01_dir/resource/flash/";

export const CSGO_ENGLISH_URL =
    "https://raw.githubusercontent.com/ByMykel/counter-strike-file-tracker/main/static/csgo_english.json";

export const LANGUAGES_URL = [
    {
        language: "portuguese (Brazil)",
        folder: "pt-BR",
        url: getLanguageUrl("brazilian"),
    },
    {
        language: "bulgarian",
        folder: "bg",
        url: getLanguageUrl("bulgarian"),
    },
    {
        language: "czech",
        folder: "cs",
        url: getLanguageUrl("czech"),
    },
    {
        language: "danish",
        folder: "da",
        url: getLanguageUrl("danish"),
    },
    {
        language: "dutch",
        folder: "nl",
        url: getLanguageUrl("dutch"),
    },
    {
        language: "english",
        folder: "en",
        url: getLanguageUrl("english"),
    },
    {
        language: "finnish",
        folder: "fi",
        url: getLanguageUrl("finnish"),
    },
    {
        language: "french",
        folder: "fr",
        url: getLanguageUrl("french"),
    },
    {
        language: "german",
        folder: "de",
        url: getLanguageUrl("german"),
    },
    {
        language: "greek",
        folder: "el",
        url: getLanguageUrl("greek"),
    },
    {
        language: "hungarian",
        folder: "hu",
        url: getLanguageUrl("hungarian"),
    },
    {
        language: "italian",
        folder: "it",
        url: getLanguageUrl("italian"),
    },
    {
        language: "japanese",
        folder: "ja",
        url: getLanguageUrl("japanese"),
    },
    {
        language: "korean",
        folder: "ko",
        url: getLanguageUrl("koreana"),
    },
    // {
    // language: "koreana",
    // folder: "ko",
    // url: getLanguageUrl("koreana"),
    // },
    {
        language: "spanish (Latin America)",
        folder: "es-MX",
        url: getLanguageUrl("latam"),
    },
    {
        language: "norwegian",
        folder: "no",
        url: getLanguageUrl("norwegian"),
    },
    //   {
    //     language: "pirate",
    //     folder: "pirate",
    //     url: getLanguageUrl("pirate"),
    //   },
    {
        language: "polish",
        folder: "pl",
        url: getLanguageUrl("polish"),
    },
    {
        language: "portuguese",
        folder: "pt-PT",
        url: getLanguageUrl("portuguese"),
    },
    {
        language: "romanian",
        folder: "ro",
        url: getLanguageUrl("romanian"),
    },
    {
        language: "russian",
        folder: "ru",
        url: getLanguageUrl("russian"),
    },
    // {
    //     language: "schinese_pw",
    //     folder: "zh-CN",
    //     url: getLanguageUrl("schinese_pw"),
    // },
    {
        language: "schinese",
        folder: "zh-CN",
        url: getLanguageUrl("schinese"),
    },
    {
        language: "spanish",
        folder: "es-ES",
        url: getLanguageUrl("spanish"),
    },
    {
        language: "swedish",
        folder: "sv",
        url: getLanguageUrl("swedish"),
    },
    {
        language: "tchinese",
        folder: "zh-TW",
        url: getLanguageUrl("tchinese"),
    },
    {
        language: "thai",
        folder: "th",
        url: getLanguageUrl("thai"),
    },
    {
        language: "turkish",
        folder: "tr",
        url: getLanguageUrl("turkish"),
    },
    {
        language: "ukrainian",
        folder: "uk",
        url: getLanguageUrl("ukrainian"),
    },
    {
        language: "vietnamese",
        folder: "vi",
        url: getLanguageUrl("vietnamese"),
    },
];
