'use strict';

/**
 * 
 * @param {Array<number>|Uint8Array|Buffer} array - If array is Buffer, it will parse it as Uint8Array
 * @returns {String} - String.fromCharCode(array[i])
 */
module.exports = function arrayToString(array) {
    if (array instanceof Buffer) {
        array = new Uint8Array(array);
    }
    let str = '';
    for (let i = 0; i < array.length; i++) {
        str += String.fromCharCode(array[i]);
    }
    return str;
};