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
];

// Function to get type of a value
function getType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    return typeof value;
}

// Function to analyze object structure
function analyzeStructure(obj, depth = 0, maxDepth = 2) {
    const fields = [];

    if (depth > maxDepth) {
        return fields;
    }

    for (const [key, value] of Object.entries(obj)) {
        const type = getType(value);
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
        else if (key === "contains") description = "Items that can be obtained";
        else if (key === "contains_rare") description = "Rare items (knives, etc.)";
        else if (key === "skin_id") description = "Reference to grouped skin";
        else if (key === "wear") description = "Specific wear condition";
        else if (key === "style") description = "Finish style information";
        else if (key === "original") description = "Original item data";
        else description = `${key.replace(/_/g, " ")}`;

        // Handle nullable types
        let typeStr = type;
        if (value === null && obj[key] === null) {
            // Check if other objects have this field as non-null
            typeStr = "string|null";
        } else if (value === null) {
            typeStr = `${getType(obj[key])}|null`;
        }

        fields.push({
            key,
            type: typeStr,
            description,
            isObject: type === "object" && !Array.isArray(value) && value !== null,
            isArray: type === "array",
        });
    }

    return fields;
}

// Function to generate Response Structure HTML
function generateResponseStructure(sampleObject, isObject = false) {
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

    const fields = analyzeStructure(sampleObject);

    let html = `
                            <div class="structure-item">
                                <span class="structure-key">Array</span> of objects with:
                            </div>`;

    fields.forEach(field => {
        // Extract base type for class (handle cases like "string|null")
        const baseType = field.type.split("|")[0].split("[")[0];
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

            let sampleObject;
            if (endpoint.isObject) {
                // For objects, get the first value
                const keys = Object.keys(data);
                if (keys.length > 0) {
                    sampleObject = data[keys[0]];
                } else {
                    console.warn(`Warning: ${endpoint.id} is empty, skipping`);
                    return;
                }
            } else {
                // For arrays, get the first element
                if (Array.isArray(data) && data.length > 0) {
                    sampleObject = data[0];
                } else {
                    console.warn(`Warning: ${endpoint.id} is empty, skipping`);
                    return;
                }
            }

            const responseStructureHtml = generateResponseStructure(sampleObject, endpoint.isObject);
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
