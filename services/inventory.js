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
    agents,
    patches,
    keys,
    stickerSlabs,
    tools,
}) => {
    const items = {};

    skins.forEach(skin => {
        if (!items["skins"]) items["skins"] = {};
        if (!items["skins"][skin.weapon.weapon_id]) items["skins"][skin.weapon.weapon_id] = {};

        items["skins"][skin.weapon.weapon_id][skin.paint_index] = {
            name: skin.name,
            rarity: skin.rarity,
            marketable: true,
            image: skin.image,
        };
    });

    crates.forEach(crate => {
        if (!items["crates"]) items["crates"] = {};
        if (!items["crates"][crate.id.replace("crate-", "")])
            items["crates"][crate.id.replace("crate-", "")] = {};

        items["crates"][crate.id.replace("crate-", "")] = {
            name: crate.name,
            rarity: crate.rarity,
            marketable: !!crate.market_hash_name,
            image: crate.image,
        };
    });

    collectibles.forEach(collectible => {
        if (!items["collectibles"]) items["collectibles"] = {};
        if (!items["collectibles"][collectible.id.replace("collectible-", "")])
            items["collectibles"][collectible.id.replace("collectible-", "")] = {};

        items["collectibles"][collectible.id.replace("collectible-", "")] = {
            name: collectible.name,
            rarity: collectible.rarity,
            marketable: !!collectible.market_hash_name,
            image: collectible.image,
        };
    });

    stickers.forEach(sticker => {
        if (!items["stickers"]) items["stickers"] = {};
        if (!items["stickers"][sticker.id.replace("sticker-", "")])
            items["stickers"][sticker.id.replace("sticker-", "")] = {};

        items["stickers"][sticker.id.replace("sticker-", "")] = {
            name: sticker.name,
            rarity: sticker.rarity,
            marketable: !!sticker.market_hash_name,
            image: sticker.image,
        };
    });

    graffiti.forEach(graffiti => {
        if (!items["graffiti"]) items["graffiti"] = {};
        if (!items["graffiti"][graffiti.id.replace("graffiti-", "")])
            items["graffiti"][graffiti.id.replace("graffiti-", "")] = {};

        items["graffiti"][graffiti.id.replace("graffiti-", "")] = {
            name: graffiti.name,
            rarity: graffiti.rarity,
            marketable: !!graffiti.market_hash_name,
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
                rarity: musicKit.rarity,
                marketable: !!musicKit.market_hash_name,
                image: musicKit.image,
            };
        }
    });

    keychains.forEach(keychain => {
        if (!items["keychains"]) items["keychains"] = {};
        items["keychains"][keychain.id.replace("keychain-", "")] = {
            name: keychain.name,
            rarity: keychain.rarity,
            marketable: !!keychain.market_hash_name,
            image: keychain.image,
        };
    });

    highlights.forEach(highlight => {
        if (!items["highlights"]) items["highlights"] = {};
        items["highlights"][highlight.id.replace("highlight-", "")] = {
            name: highlight.name,
            rarity: highlight.rarity ?? null,
            marketable: !!highlight.market_hash_name,
            image: highlight.image,
        };
    });

    agents.forEach(agent => {
        if (!items["agents"]) items["agents"] = {};
        items["agents"][agent.id.replace("agent-", "")] = {
            name: agent.name,
            rarity: agent.rarity,
            marketable: !!agent.market_hash_name,
            image: agent.image,
        };
    });

    patches.forEach(patch => {
        if (!items["patches"]) items["patches"] = {};
        items["patches"][patch.id.replace("patch-", "")] = {
            name: patch.name,
            rarity: patch.rarity,
            marketable: !!patch.market_hash_name,
            image: patch.image,
        };
    });

    keys.forEach(key => {
        if (!items["keys"]) items["keys"] = {};
        items["keys"][key.id.replace("key-", "")] = {
            name: key.name,
            rarity: key.rarity ?? null,
            marketable: !!key.market_hash_name,
            image: key.image,
        };
    });

    stickerSlabs.forEach(stickerSlab => {
        if (!items["sticker_slabs"]) items["sticker_slabs"] = {};
        items["sticker_slabs"][stickerSlab.id.replace("sticker_slab-", "")] = {
            name: stickerSlab.name,
            rarity: stickerSlab.rarity,
            marketable: !!stickerSlab.market_hash_name,
            image: stickerSlab.image,
        };
    });

    tools.forEach(tool => {
        if (!items["tools"]) items["tools"] = {};
        items["tools"][tool.id.replace("tool-", "")] = {
            name: tool.name,
            rarity: tool.rarity ?? null,
            marketable: !!tool.market_hash_name,
            image: tool.image,
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
    const agentsFilePath = path.join(process.cwd(), `./public/api/${folder}/agents.json`);
    const patchesFilePath = path.join(process.cwd(), `./public/api/${folder}/patches.json`);
    const keysFilePath = path.join(process.cwd(), `./public/api/${folder}/keys.json`);
    const stickerSlabsFilePath = path.join(process.cwd(), `./public/api/${folder}/sticker_slabs.json`);
    const toolsFilePath = path.join(process.cwd(), `./public/api/${folder}/tools.json`);

    try {
        const skins = await waitForFile(skinsFilePath);
        const crates = await waitForFile(cratesFilePath);
        const collectibles = await waitForFile(collectiblesFilePath);
        const stickers = await waitForFile(stickersFilePath);
        const graffiti = await waitForFile(graffitiFilePath);
        const musicKits = await waitForFile(musicKitsFilePath);
        const keychains = await waitForFile(keychainsFilePath);
        const highlights = await waitForFile(highlightsFilePath);
        const agents = await waitForFile(agentsFilePath);
        const patches = await waitForFile(patchesFilePath);
        const keys = await waitForFile(keysFilePath);
        const stickerSlabs = await waitForFile(stickerSlabsFilePath);
        const tools = await waitForFile(toolsFilePath);
        const inventory = formatInventoryData({
            skins,
            crates,
            collectibles,
            stickers,
            graffiti,
            musicKits,
            keychains,
            highlights,
            agents,
            patches,
            keys,
            stickerSlabs,
            tools,
        });
        saveDataJson(`./public/api/${folder}/inventory.json`, inventory);
    } catch (error) {
        console.error(error.message);
    }
};
