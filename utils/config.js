export const ITEMS_GAME_URL =
    "https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/scripts/items/items_game.txt";

export const IMAGES_BASE_URL =
    "https://raw.githubusercontent.com/steamdatabase/gametracking-csgo/108f1682bf7eeb1420caaf2357da88b614a7e1b0/csgo/pak01_dir/resource/flash/";

export const CSGO_ENGLISH_URL =
    "https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/resource/csgo_english.txt";

export const LANGUAGES = [
    "brazilian",
    "bulgarian",
    "czech",
    "danish",
    "dutch",
    "english",
    "finnish",
    "french",
    "german",
    "greek",
    "hungarian",
    "italian",
    "japanese",
    "korean",
    "koreana",
    "latam",
    "norwegian",
    "pirate",
    "polish",
    "portuguese",
    "romanian",
    "russian",
    "schinese_pw",
    "schinese",
    "spanish",
    "swedish",
    "tchinese",
    "thai",
    "turkish",
    "ukrainian",
    // "vietnamese", // Got syntax error while parsing
];

export const LANGUAGES_URL = LANGUAGES.map((language) => ({
    language: language,
    folder: language === "english" ? "" : language,
    url: `https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/csgo/resource/csgo_${language}.txt`,
}));
