import { saveDataJson } from "./saveDataJson.js";
import { getSavedData, removeDataMemory } from "./saveDataMemory.js";

export const saveAllItems = (language, folder) => {
    try {
        saveDataJson(`./public/api/${folder}/all.json`, getSavedData(language));
        removeDataMemory(language);
    } catch (error) {
        console.log(error);
    }
};
