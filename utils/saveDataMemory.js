export let memory = {};

export const getSavedData = (language) => {
    return memory[language];
};

export const saveDataMemory = (language, items) => {
    if (memory[language] === undefined) memory[language] = {};

    memory[language] = {
        ...memory[language],
        ...items.reduce(
            (acc, item) => ({
                ...acc,
                [item.id]: item,
            }),
            {}
        ),
    };
};

export const removeDataMemory = (language) => {
    delete memory[language];
};
