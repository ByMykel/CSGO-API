import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import cdn from "../public/api/cdn_images.json" assert { type: "json" };

export const getTools = () => {
    const { folder } = languageData;

    const tools = [
        {
            id: "tool-1",
            name: $t("csgo_tool_name_tag"),
            description: $t("csgo_tool_name_tag_desc"),
            image: cdn["econ/tools/tag_large"],
        },
        {
            id: "tool-2",
            name: $t("csgo_tool_casket_tag"),
            description: $t("csgo_tool_casket_tag_desc"),
            image: cdn["econ/tools/casket_large"],
        },
        {
            id: "tool-3",
            name: $t("csgo_tool_stattrak_swap"),
            description: $t("csgo_tool_stattrak_swap_desc"),
            image: cdn["econ/tools/stattrak_swap_tool"],
        },
    ];

    saveDataJson(`./public/api/${folder}/tools.json`, tools);
};
