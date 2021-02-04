/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
    if (obj === undefined) return;

    const newObj = {};
    Object.entries(obj).forEach(([k,v]) => {
        newObj[v] = k;
    });
    return newObj;
}
