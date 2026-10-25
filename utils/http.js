export const getJson = async url => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}: ${url}`);
    return res.json();
};
