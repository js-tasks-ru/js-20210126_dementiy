/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if (size === undefined) {
        return string;
    }

    let newString = "";
    let curSize = 0;
    let prevCharacter = null;

    for (const ch of string) {
        if (prevCharacter !== null && ch === prevCharacter) {
            curSize++;
        } else {
            prevCharacter = ch;
            curSize = 1;
        }
        if (curSize <= size) {
            newString += ch;
        }
    }

    return newString;
}
