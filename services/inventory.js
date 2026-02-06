import fs from "fs";
import path from "path";
import { saveDataJson } from "../utils/saveDataJson.js";
import { languageData } from "./translations.js";

const formatInventoryData = ({
    skins,
    crates,
    collectibles,
    stickers,
    graffiti,
    musicKits,
    keychains,
    highlights,
}) => {
    const items = {};

    skins.forEach(skin => {
        if (!items["skins"]) items["skins"] = {};
        if (!items["skins"][skin.weapon.weapon_id]) items["skins"][skin.weapon.weapon_id] = {};

        items["skins"][skin.weapon.weapon_id][skin.paint_index] = {
            name: skin.name,
            // market_hash_name: skin.market_hash_name,
            image: skin.image,
        };
    });

    crates.forEach(crate => {
        if (!items["crates"]) items["crates"] = {};
        if (!items["crates"][crate.id.replace("crate-", "")])
            items["crates"][crate.id.replace("crate-", "")] = {};

        items["crates"][crate.id.replace("crate-", "")] = {
            name: crate.name,
            // market_hash_name: crate.market_hash_name,
            image: crate.image,
        };
    });

    collectibles.forEach(collectible => {
        if (!items["collectibles"]) items["collectibles"] = {};
        if (!items["collectibles"][collectible.id.replace("collectible-", "")])
            items["collectibles"][collectible.id.replace("collectible-", "")] = {};

        items["collectibles"][collectible.id.replace("collectible-", "")] = {
            name: collectible.name,
            // market_hash_name: collectible.market_hash_name,
            image: collectible.image,
        };
    });

    stickers.forEach(sticker => {
        if (!items["stickers"]) items["stickers"] = {};
        if (!items["stickers"][sticker.id.replace("sticker-", "")])
            items["stickers"][sticker.id.replace("sticker-", "")] = {};

        items["stickers"][sticker.id.replace("sticker-", "")] = {
            name: sticker.name,
            // market_hash_name: sticker.market_hash_name,
            image: sticker.image,
        };
    });

    graffiti.forEach(graffiti => {
        if (!items["graffiti"]) items["graffiti"] = {};
        if (!items["graffiti"][graffiti.id.replace("graffiti-", "")])
            items["graffiti"][graffiti.id.replace("graffiti-", "")] = {};

        items["graffiti"][graffiti.id.replace("graffiti-", "")] = {
            name: graffiti.name,
            // market_hash_name: graffiti.market_hash_name,
            image: graffiti.image,
        };
    });

    musicKits.forEach(musicKit => {
        if (!musicKit.id.includes("_st")) {
            if (!items["music_kits"]) items["music_kits"] = {};
            if (!items["music_kits"][musicKit.id.replace("music_kit-", "")])
                items["music_kits"][musicKit.id.replace("music_kit-", "")] = {};

            items["music_kits"][musicKit.id.replace("music_kit-", "")] = {
                name: musicKit.name,
                // market_hash_name: musicKit.market_hash_name,
                image: musicKit.image,
            };
        }
    });

    keychains.forEach(keychain => {
        if (!items["keychains"]) items["keychains"] = {};
        items["keychains"][keychain.id.replace("keychain-", "")] = {
            name: keychain.name,
            // market_hash_name: keychain.market_hash_name,
            image: keychain.image,
        };
    });

    highlights.forEach(highlight => {
        if (!items["highlights"]) items["highlights"] = {};
        items["highlights"][highlight.id.replace("highlight-", "")] = {
            name: highlight.name,
            // market_hash_name: highlight.market_hash_name,
            image: highlight.image,
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
    const collectiblesFilePath = path.join(process.cwd(), `./public/api/${folder}/collectibles.json`);
    const stickersFilePath = path.join(process.cwd(), `./public/api/${folder}/stickers.json`);
    const graffitiFilePath = path.join(process.cwd(), `./public/api/${folder}/graffiti.json`);
    const musicKitsFilePath = path.join(process.cwd(), `./public/api/${folder}/music_kits.json`);
    const keychainsFilePath = path.join(process.cwd(), `./public/api/${folder}/keychains.json`);
    const highlightsFilePath = path.join(process.cwd(), `./public/api/${folder}/highlights.json`);

    try {
        const skins = await waitForFile(skinsFilePath);
        const crates = await waitForFile(cratesFilePath);
        const collectibles = await waitForFile(collectiblesFilePath);
        const stickers = await waitForFile(stickersFilePath);
        const graffiti = await waitForFile(graffitiFilePath);
        const musicKits = await waitForFile(musicKitsFilePath);
        const keychains = await waitForFile(keychainsFilePath);
        const highlights = await waitForFile(highlightsFilePath);
        const inventory = formatInventoryData({
            skins,
            crates,
            collectibles,
            stickers,
            graffiti,
            musicKits,
            keychains,
            highlights,
        });
        saveDataJson(`./public/api/${folder}/inventory.json`, inventory);
    } catch (error) {
        console.error(error.message);
    }
};
