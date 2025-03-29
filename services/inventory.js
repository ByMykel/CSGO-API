import fs from "fs";
import path from "path";
import { saveDataJson } from "../utils/saveDataJson.js";
import { languageData } from "./translations.js";

const formatInventoryData = (skins) => {
    return skins.reduce((acc, skin) => {
        if (!acc['skins']) acc['skins'] = {};
        if (!acc['skins'][skin.weapon.weapon_id]) acc['skins'][skin.weapon.weapon_id] = {};
        
        acc['skins'][skin.weapon.weapon_id][skin.paint_index] = {
            name: skin.name,
            image: skin.image,
        };
        return acc;
    }, {});
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
    const filePath = path.join(process.cwd(), `./public/api/${folder}/skins.json`);
    
    try {
        const skins = await waitForFile(filePath);
        const inventory = formatInventoryData(skins);
        saveDataJson(`./public/api/${folder}/inventory.json`, inventory);
    } catch (error) {
        console.error(error.message);
    }
};
