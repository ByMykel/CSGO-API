import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { getImageUrl } from "../constants.js";

export const getTools = () => {
    const { folder } = languageData;

    const tools = [
        {
            id: "tool-1",
            name: $t("csgo_tool_name_tag"),
            description: $t("csgo_tool_name_tag_desc"),
            image: getImageUrl("econ/tools/tag"),
        },
        {
            id: "tool-2",
            name: $t("csgo_tool_casket_tag"),
            description: $t("csgo_tool_casket_tag_desc"),
            image: getImageUrl("econ/tools/casket"),
        },
        {
            id: "tool-3",
            name: $t("csgo_tool_stattrak_swap"),
            description: $t("csgo_tool_stattrak_swap_desc"),
            image: getImageUrl("econ/tools/stattrak_swap_tool"),
        },
        {
            id: "tool-4",
            name: $t("csgo_removekeychainTool_title"),
            description: $t("csgo_removekeychaintool_desc"),
            image: getImageUrl("econ/tools/keychain_remove_tool"),
        },
    ];

    saveDataJson(`./public/api/${folder}/tools.json`, tools);
};
