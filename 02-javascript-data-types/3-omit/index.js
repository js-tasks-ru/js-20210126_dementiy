/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
    let new_obj = {};
    for (let field in obj) {
        if (!fields.includes(field)) {
            new_obj[field] = obj[field];
        }
    }
    return new_obj;
};
