import fs from "fs";
import path from "path";
import { saveDataJson } from "../utils/saveDataJson.js";
import { languageData } from "./translations.js";

const formatInventoryData = ({ skins, crates }) => {
    const items = {}

    skins.forEach((skin) => {
        if (!items['skins']) items['skins'] = {};
        if (!items['skins'][skin.weapon.weapon_id]) items['skins'][skin.weapon.weapon_id] = {};
        
        items['skins'][skin.weapon.weapon_id][skin.paint_index] = {
            name: skin.name,
            market_hash_name: skin.market_hash_name,
            image: skin.image,
        };
    });

    crates.forEach((crate) => {
        if (!items['crates']) items['crates'] = {};
        if (!items['crates'][crate.id.replace('crate-', '')]) items['crates'][crate.id.replace('crate-', '')] = {};

        items['crates'][crate.id.replace('crate-', '')] = {
            name: crate.name,
            market_hash_name: crate.market_hash_name,
            image: crate.image,
        };
    });

    return items;
};

const waitForFile = async (filePath, maxRetries = 5, retryDelay = 2000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    throw new Error(`Failed to read ${filePath} after ${maxRetries} attempts`);
};

export const getInventory = async () => {
    const { folder } = languageData;
    const skinsFilePath = path.join(process.cwd(), `./public/api/${folder}/skins.json`);
    const cratesFilePath = path.join(process.cwd(), `./public/api/${folder}/crates.json`);

    try {
        const skins = await waitForFile(skinsFilePath);
        const crates = await waitForFile(cratesFilePath);
        const inventory = formatInventoryData({ skins, crates });
        saveDataJson(`./public/api/${folder}/inventory.json`, inventory);
    } catch (error) {
        console.error(error.message);
    }
};
