import * as fs from "fs";

export const saveDataJson = (file, data) => {
    // I beautify the JSON data because it's easier for me see the changes
    const json = JSON.stringify(data, null, 1);

    const folders = file
        .replace(/\.\/public\/api\/(.*)\/(.*)\.json/, "$1")
        .split("/");

    // Create api folder if it doesn't exist
    if (!fs.existsSync("./public/api")) {
        fs.mkdirSync("./public/api");
    }

    folders.forEach((folder, index) => {
        const path = folders.slice(0, index + 1).join("/");

        if (!fs.existsSync(`./public/api/${path}`)) {
            fs.mkdirSync(`./public/api/${path}`);
        }
    });

    fs.writeFile(file, json, (err) => {
        if (err) throw err;

        // console.log(`JSON data is saved in ${file}.`);
    });
};
