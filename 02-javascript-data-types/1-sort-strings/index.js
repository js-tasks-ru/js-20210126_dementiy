/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    if (param != "asc" && param != "desc") {
        throw new Error(`Wrong order parameter: ${param}`);
    }
    let sortedArray = [...arr].sort((a, b) => a.localeCompare(b, ["ru", "en"], {caseFirst: "upper"}));
    return param == "asc" ? sortedArray : sortedArray.reverse();
}
