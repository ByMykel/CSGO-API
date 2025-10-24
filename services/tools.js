import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { getImageUrl } from "../constants.js";
import { state } from "./main.js";

export const getTools = () => {
    const { cdnImages } = state;
    const { folder } = languageData;

    const tools = [
        {
            id: "tool-1",
            name: $t("csgo_tool_name_tag"),
            description: $t("csgo_tool_name_tag_desc"),
            image: cdnImages["econ/tools/tag"] ?? getImageUrl("econ/tools/tag"),
            def_index: "1200",
            original: {
                image_inventory: "econ/tools/tag",
            },
        },
        {
            id: "tool-2",
            name: $t("csgo_tool_casket_tag"),
            description: $t("csgo_tool_casket_tag_desc"),
            image: cdnImages["econ/tools/casket"] ?? getImageUrl("econ/tools/casket"),
            def_index: "1201",
            original: {
                image_inventory: "econ/tools/casket",
            },
        },
        {
            id: "tool-3",
            name: $t("csgo_tool_stattrak_swap"),
            description: $t("csgo_tool_stattrak_swap_desc"),
            image: cdnImages["econ/tools/stattrak_swap_tool"] ?? getImageUrl("econ/tools/stattrak_swap_tool"),
            def_index: "1324",
            original: {
                image_inventory: "econ/tools/stattrak_swap_tool",
            },
        },
        {
            id: "tool-4",
            name: $t("csgo_removekeychainTool_title"),
            description: $t("csgo_removekeychaintool_desc"),
            image:
                cdnImages["econ/tools/keychain_remove_tool"] ??
                getImageUrl("econ/tools/keychain_remove_tool"),
            def_index: "65",
            original: {
                image_inventory: "econ/tools/keychain_remove_tool",
            },
        },
    ];

    saveDataJson(`./public/api/${folder}/tools.json`, tools);
};
