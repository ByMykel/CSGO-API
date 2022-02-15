import * as fs from "fs";
import { skins } from "./services/csgo.js";

(async () => {
    const data = await skins();
    const json = JSON.stringify(data, null, 4);

    fs.writeFile("api/skins.json", json, (err) => {
        if (err) {
            throw err;
        }

        console.log("JSON data is saved.");
    });
})();
