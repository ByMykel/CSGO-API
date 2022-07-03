import * as fs from "fs";
import { saveDataJson } from "./saveDataJson.js";

const fetchData = async (file, language) => {
    return await fs.promises.readFile(
        `./public/api/${language}/${file}.json`,
        "utf-8"
    );
};

export const getAllItems = async (language) => {
    let allItems = {};
    const files = [
        "agents",
        "collectibles",
        "collections",
        "crates",
        "graffiti",
        "keys",
        "music_kits",
        "patches",
        "skins",
        "stickers",
    ];

    for (const file of files) {
        const data = JSON.parse(await fetchData(file, language));
        const parsedData = data.reduce(
            (items, item) => ({
                ...items,
                [item.id]: item,
            }),
            {}
        );

        allItems = { ...allItems, ...parsedData };
    }

    saveDataJson(`./public/api/${language}/all.json`, allItems);
};
