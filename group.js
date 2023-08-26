import fs from "fs";
import path from "path";
import { LANGUAGES_URL } from "./constants.js";

const inputFilePathsTemplate = [
    "./public/api/{lang}/agents.json",
    "./public/api/{lang}/collectibles.json",
    "./public/api/{lang}/collections.json",
    "./public/api/{lang}/crates.json",
    "./public/api/{lang}/graffiti.json",
    "./public/api/{lang}/keys.json",
    "./public/api/{lang}/music_kits.json",
    "./public/api/{lang}/patches.json",
    "./public/api/{lang}/skins_not_grouped.json",
    "./public/api/{lang}/stickers.json",
];

for (let langObj of LANGUAGES_URL) {
    const lang = langObj.folder;
    const allData = {};

    const inputFilePaths = inputFilePathsTemplate.map((templatePath) =>
        templatePath.replace("{lang}", lang)
    );

    for (let filePath of inputFilePaths) {
        const fullPath = path.join(process.cwd(), filePath);

        // Check if file exists before reading
        if (fs.existsSync(fullPath)) {
            const fileData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            if (Array.isArray(fileData)) {
                fileData.forEach((item) => {
                    allData[item.id] = item;
                });
            }
        } else {
            console.warn(`File ${fullPath} not found.`);
        }
    }

    const outputFilePath = `./public/api/${lang}/all.json`;
    fs.writeFileSync(outputFilePath, JSON.stringify(allData, null, 4));

    console.log(`all.json for ${lang} has been generated.`);
}
