/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
    let new_obj = {};
    for (let field of fields) {
        new_obj[field] = obj[field];
    }
    return new_obj;
};
