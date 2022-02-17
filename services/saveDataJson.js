import * as fs from "fs";

export const saveDataJson = (file, data) => {
    fs.writeFile(file, data, (err) => {
        if (err) {
            throw err;
        }

        console.log(`JSON data is saved in ${file}.`);
    });
};
