import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for all endpoints
const endpoints = [
    {
        id: "list-all",
        title: "List all",
        description: "Object with all items accessible by their id.",
        endpoint: "/all.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/all.json",
        jsonFile: "public/api/en/all.json",
        isObject: true, // Special case - it's an object, not an array
    },
    {
        id: "list-skins",
        title: "List skins",
        description: "Returns an array of all weapon skins grouped by pattern and wear condition.",
        endpoint: "/skins.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json",
        jsonFile: "public/api/en/skins.json",
    },
    {
        id: "list-skins-not-grouped",
        title: "List skins not grouped",
        description: "Returns an array of all weapon skins with each wear condition as a separate item.",
        endpoint: "/skins_not_grouped.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
        jsonFile: "public/api/en/skins_not_grouped.json",
    },
    {
        id: "list-stickers",
        title: "List stickers",
        description: "Returns an array of all available stickers.",
        endpoint: "/stickers.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json",
        jsonFile: "public/api/en/stickers.json",
    },
    {
        id: "list-sticker-slabs",
        title: "List sticker slabs",
        description: "Returns an array of sticker slabs (sealed stickers that can be opened).",
        endpoint: "/sticker_slabs.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/sticker_slabs.json",
        jsonFile: "public/api/en/sticker_slabs.json",
    },
    {
        id: "list-keychain",
        title: "List keychains",
        description: "Returns an array of all weapon charms/keychains.",
        endpoint: "/keychains.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/keychains.json",
        jsonFile: "public/api/en/keychains.json",
    },
    {
        id: "list-collections",
        title: "List collections",
        description: "Returns an array of all weapon skin collections.",
        endpoint: "/collections.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collections.json",
        jsonFile: "public/api/en/collections.json",
    },
    {
        id: "list-crates",
        title: "List crates",
        description:
            "This list includes cases, capsules, graffiti boxes, music kit boxes and souvenir packages.",
        endpoint: "/crates.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/crates.json",
        jsonFile: "public/api/en/crates.json",
    },
    {
        id: "list-keys",
        title: "List keys",
        description: "Returns an array of all case keys.",
        endpoint: "/keys.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/keys.json",
        jsonFile: "public/api/en/keys.json",
    },
    {
        id: "list-collectibles",
        title: "List collectibles",
        description: "Returns an array of all collectible items (coins, medals, etc.).",
        endpoint: "/collectibles.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collectibles.json",
        jsonFile: "public/api/en/collectibles.json",
    },
    {
        id: "list-agents",
        title: "List agents",
        description: "Returns an array of all player agents/characters.",
        endpoint: "/agents.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/agents.json",
        jsonFile: "public/api/en/agents.json",
    },
    {
        id: "list-patches",
        title: "List patches",
        description: "Returns an array of all agent patches.",
        endpoint: "/patches.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/patches.json",
        jsonFile: "public/api/en/patches.json",
    },
    {
        id: "list-graffiti",
        title: "List graffiti",
        description: "Returns an array of all graffiti items.",
        endpoint: "/graffiti.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/graffiti.json",
        jsonFile: "public/api/en/graffiti.json",
    },
    {
        id: "list-music-kits",
        title: "List music kits",
        description: "Returns an array of all music kits.",
        endpoint: "/music_kits.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/music_kits.json",
        jsonFile: "public/api/en/music_kits.json",
    },
    {
        id: "list-base-weapons",
        title: "List base weapons",
        description: "Returns an array of all base weapons and default items (gloves, knives, etc.).",
        endpoint: "/base_weapons.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/base_weapons.json",
        jsonFile: "public/api/en/base_weapons.json",
    },
    {
        id: "list-highlights",
        title: "List highlights",
        description: "Returns an array of tournament highlight charms.",
        endpoint: "/highlights.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/highlights.json",
        jsonFile: "public/api/en/highlights.json",
    },
    {
        id: "inventory",
        title: "Inventory",
        description:
            "All items grouped by category for easy lookup. Skins use weapon_id and paint_index as keys, while other categories use def_index.",
        endpoint: "/inventory.json",
        url: "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/inventory.json",
        jsonFile: "public/api/en/inventory.json",
        isInventory: true,
    },
];

// Function to get type of a value
function getType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return typeof value;
}

// Walks every item so fields that are null or missing on the first item still get the right type
function collectFields(items) {
    const keys = [];
    const info = {};

    for (const item of items) {
        let previous = null;

        for (const [key, value] of Object.entries(item)) {
            if (!(key in info)) {
                // Keep optional fields next to the field they follow in the item
                keys.splice(previous === null ? 0 : keys.indexOf(previous) + 1, 0, key);
                info[key] = { types: new Set(), nullable: false, count: 0 };
            }

            info[key].count++;
            if (value === null) info[key].nullable = true;
            else info[key].types.add(getType(value));

            previous = key;
        }
    }

    return keys.map(key => ({
        key,
        types: [...info[key].types],
        nullable: info[key].nullable,
        optional: info[key].count < items.length,
    }));
}

// Function to analyze object structure
function analyzeStructure(items) {
    const fields = [];

    for (const { key, types, nullable, optional } of collectFields(items)) {
        let description = "";

        // Generate description based on key name
        if (key === "id") description = "Unique identifier";
        else if (key === "name") description = "Item name";
        else if (key === "description") description = "Item description";
        else if (key === "image") description = "Image URL";
        else if (key === "rarity") description = "Rarity with color";
        else if (key === "weapon") description = "Weapon information";
        else if (key === "pattern") description = "Pattern/skin design";
        else if (key === "wears") description = "Available wear conditions";
        else if (key === "collections") description = "Collections containing this item";
        else if (key === "crates") description = "Crates containing this item";
        else if (key === "tournament") description = "Tournament information";
        else if (key === "team") description = "Team information (CT/T)";
        else if (key === "type") description = "Item type";
        else if (key === "effect") description = "Sticker effect (Foil, Holo, etc.)";
        else if (key === "market_hash_name") description = "Market hash name";
        else if (key === "def_index") description = "Definition index";
        else if (key === "exclusive") description = "Whether it's exclusive";
        else if (key === "genuine") description = "Whether it's genuine";
        else if (key === "marketable") description = "Whether it's marketable";
        else if (key === "model_player") description = "Player model path";
        else if (key === "tournament_player") description = "Tournament player name";
        else if (key === "tournament_event") description = "Tournament event name";
        else if (key === "team0") description = "First team name";
        else if (key === "team1") description = "Second team name";
        else if (key === "stage") description = "Tournament stage";
        else if (key === "map") description = "Map name";
        else if (key === "video") description = "Video URL";
        else if (key === "thumbnail") description = "Thumbnail image URL";
        else if (key === "rental") description = "Whether it's a rental";
        else if (key === "first_sale_date") description = "First sale date";
        else if (key === "release_date")
            description = "Release date, can differ from the first_sale_date of the linked crate";
        else if (key === "contains") description = "Items that can be obtained";
        else if (key === "contains_rare") description = "Rare items (knives, etc.)";
        else if (key === "skin_id") description = "Reference to grouped skin";
        else if (key === "wear") description = "Specific wear condition";
        else if (key === "style") description = "Finish style information";
        else if (key === "original") description = "Original item data";
        else if (key === "tint") description = "Graffiti tint with hex color";
        else if (key === "color_index") description = "Graffiti tint index";
        else if (key === "icon_base") description = "Keychain family";
        else if (key === "phase") description = "Doppler phase";
        else if (key === "special_notes")
            description = "Interesting facts about the item, each with a source link";
        else if (key === "player") description = "Player information";
        else if (key === "premier_season") description = "Premier season number";
        else if (key === "loot_list") description = "Loot list information";
        else if (key === "paint_index") description = "Paint kit index";
        else description = `${key.replace(/_/g, " ")}`;

        // Fields that are always null have no other type to show, assume string
        let typeStr = (types.length > 0 ? types : ["string"]).join("|");
        if (nullable) typeStr += "|null";
        if (optional) typeStr += ", optional";

        fields.push({
            key,
            type: typeStr,
            description,
            isObject: types.includes("object"),
            isArray: types.includes("array"),
        });
    }

    return fields;
}

// Function to generate Response Structure HTML
function generateResponseStructure(items, isObject = false, isInventory = false) {
    if (isInventory) {
        return `
                            <div class="structure-item">
                                <span class="structure-key">Object</span> with categories:
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">skins</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by weapon_id, then paint_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">crates</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">collectibles</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">stickers</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">graffiti</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">music_kits</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">keychains</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">highlights</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">agents</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">patches</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">keys</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">sticker_slabs</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">tools</span>
                                <span class="structure-type type-object">(object)</span> - Keyed by def_index
                            </div>
                            <div class="structure-item mt-3">
                                Each item has:
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">name</span>
                                <span class="structure-type type-string">(string)</span> - Item name
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">rarity</span>
                                <span class="structure-type type-object">(object|null)</span> - Rarity with color
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">marketable</span>
                                <span class="structure-type type-boolean">(boolean)</span> - Whether it's marketable
                            </div>
                            <div class="structure-item ml-4">
                                <span class="structure-key">image</span>
                                <span class="structure-type type-string">(string)</span> - Image URL
                            </div>`;
    }

    if (isObject) {
        // Special handling for "list-all" which is an object
        return `
                            <div class="structure-item">
                                <span class="structure-key">Object</span> with all items accessible by their id:
                            </div>
                            <div class="structure-item ml-4">
                                Each key is an item <span class="structure-key">id</span>
                                <span class="structure-type type-string">(string)</span>
                            </div>
                            <div class="structure-item ml-4">
                                Each value is an item <span class="structure-key">object</span> containing all item data
                            </div>`;
    }

    const fields = analyzeStructure(items);

    let html = `
                            <div class="structure-item">
                                <span class="structure-key">Array</span> of objects with:
                            </div>`;

    fields.forEach(field => {
        // Extract base type for class (handle cases like "string|null")
        const baseType = field.type.split(/[|,]/)[0].split("[")[0];
        html += `
                            <div class="structure-item ml-4">
                                <span class="structure-key">${field.key}</span>
                                <span class="structure-type type-${baseType}">(${field.type})</span> - ${field.description}
                            </div>`;
    });

    return html;
}

// Function to generate endpoint section HTML
function generateEndpointSection(endpoint, responseStructureHtml) {
    return `
                    <div id="${endpoint.id}" class="mb-12">
                        <h1 class="section-heading">${endpoint.title}</h1>

                        <p class="mt-2 text-base md:text-lg text-slate-700 mb-6 leading-relaxed">
                            ${endpoint.description}
                        </p>

                        <div class="request-info">
                            <div class="flex items-center">
                                <span class="request-method">GET</span>
                                <span class="font-mono text-slate-200">${endpoint.endpoint}</span>
                            </div>
                            <a
                                href="${endpoint.url}"
                                target="_blank"
                                class="hover:scale-110 transition-transform duration-200"
                            >
                                <svg
                                    class="request-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    ></path>
                                </svg>
                            </a>
                        </div>

                        <div class="response-structure">
                            <h4 class="text-slate-200 font-semibold mb-3">Response Structure</h4>${responseStructureHtml}
                        </div>
                    </div>`;
}

// Main function
function generateDocs() {
    console.log("Generating documentation...");

    const endpointHtmls = [];

    endpoints.forEach(endpoint => {
        try {
            const jsonPath = path.join(__dirname, "..", endpoint.jsonFile);

            if (!fs.existsSync(jsonPath)) {
                console.warn(`Warning: ${jsonPath} not found, skipping ${endpoint.id}`);
                return;
            }

            const jsonContent = fs.readFileSync(jsonPath, "utf8");
            const data = JSON.parse(jsonContent);

            // Arrays are analyzed item by item. Objects and inventory have a fixed structure description.
            const items = Array.isArray(data) ? data : Object.values(data);
            if (items.length === 0) {
                console.warn(`Warning: ${endpoint.id} is empty, skipping`);
                return;
            }

            const responseStructureHtml = generateResponseStructure(
                items,
                endpoint.isObject,
                endpoint.isInventory
            );
            const endpointHtml = generateEndpointSection(endpoint, responseStructureHtml);
            endpointHtmls.push(endpointHtml);

            console.log(`✓ Generated ${endpoint.id}`);
        } catch (error) {
            console.error(`Error processing ${endpoint.id}:`, error.message);
        }
    });

    // Join endpoints with <hr /> between them (but not after the last one)
    const endpointsHtml = endpointHtmls.join("\n                    <hr />\n");

    // Read the template
    const templatePath = path.join(__dirname, "..", "public", "docs", "template.html");
    let template = fs.readFileSync(templatePath, "utf8");

    // Replace the placeholder
    template = template.replace("<!-- ENDPOINTS_PLACEHOLDER -->", endpointsHtml.trim());

    // Write the output
    const outputPath = path.join(__dirname, "..", "public", "docs", "index.html");
    fs.writeFileSync(outputPath, template, "utf8");

    console.log(`\n✓ Documentation generated: ${outputPath}`);
}

// Run if called directly
generateDocs();

export { generateDocs };
