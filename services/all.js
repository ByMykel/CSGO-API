import { saveDataJson } from "./saveDataJson.js";
import { getSavedData, removeDataMemory } from "./saveDataMemory.js";

export const saveAllItems = (language, folder) => {
    try {
        const data = getSavedData(language);
        saveDataJson(`./public/api/${folder}/all.json`, data);
        removeDataMemory(language);
    } catch (error) {
        console.log(error);
    }
};
