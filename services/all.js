import { saveDataJson } from "../utils/saveDataJson.js";
import { getSavedData, removeDataMemory } from "../utils/saveDataMemory.js";

export const saveAllItems = (language, folder) => {
    try {
        saveDataJson(`./public/api/${folder}/all.json`, getSavedData(language));
        removeDataMemory(language);
    } catch (error) {
        console.log(error);
    }
};
