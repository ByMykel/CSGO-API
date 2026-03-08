import fs from "fs";
import path from "path";
import { LANGUAGES_URL } from "./constants.js";
import { getManifestId, getImagesJsonSha } from "./services/main.js";

const args = process.argv.slice(2);
const isForce = args.includes("--force");

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
    "./public/api/{lang}/sticker_slabs.json",
    "./public/api/{lang}/keychains.json",
    "./public/api/{lang}/tools.json",
];

let existingManifestId = "";
let existingImagesSha = "";
const [latestManifestId, latestImagesSha] = await Promise.all([getManifestId(), getImagesJsonSha()]);

try {
    existingManifestId = fs.readFileSync("./manifestIdGroup.txt", "utf-8");
} catch (err) {
    if (err.code != "ENOENT") {
        throw err;
    }
}

try {
    existingImagesSha = fs.readFileSync("./imagesShaGroup.txt", "utf-8");
} catch (err) {
    if (err.code != "ENOENT") {
        throw err;
    }
}

if (isForce) {
    console.log("Force flag detected, generating new data regardless of manifest Ids");
} else {
    const manifestChanged = existingManifestId !== latestManifestId;
    const imagesChanged = existingImagesSha !== latestImagesSha;

    if (!manifestChanged && !imagesChanged) {
        console.log("No changes detected in manifest or images.json, exiting");
        process.exit(0);
    }

    if (manifestChanged) {
        console.log("Manifest Id changed, generating new data.");
    }
    if (imagesChanged) {
        console.log("images.json changed, generating new data.");
    }
}

for (let langObj of LANGUAGES_URL) {
    const lang = langObj.folder;
    const allData = {};

    const inputFilePaths = inputFilePathsTemplate.map(templatePath => templatePath.replace("{lang}", lang));

    for (let filePath of inputFilePaths) {
        const fullPath = path.join(process.cwd(), filePath);

        // Check if file exists before reading
        if (fs.existsSync(fullPath)) {
            const fileData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            if (Array.isArray(fileData)) {
                fileData.forEach(item => {
                    allData[item.id] = item;
                });
            }
        } else {
            console.warn(`File ${fullPath} not found.`);
        }
    }

    const outputFilePath = `./public/api/${lang}/all.json`;
    fs.writeFileSync(outputFilePath, JSON.stringify(allData));

    console.log(`all.json for ${lang} has been generated.`);
}

try {
    fs.writeFileSync("./manifestIdGroup.txt", latestManifestId.toString());
    fs.writeFileSync("./imagesShaGroup.txt", latestImagesSha.toString());
} catch (err) {
    throw err;
}
