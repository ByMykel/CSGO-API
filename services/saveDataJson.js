import * as fs from "fs";

export const saveDataJson = (file, data) => {
    const json = JSON.stringify(data, null, 4);

    fs.writeFile(file, json, (err) => {
        if (err) throw err;

        console.log(`JSON data is saved in ${file}.`);
    });
};
