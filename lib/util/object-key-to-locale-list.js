'use strict';

/**
 * @param {<Object>} array
 * @returns {String} - example: 'directorylisting, key, size, or datecreated'
 */
module.exports = function objKeyToLocale(obj){
    let nameList = Object.keys(obj)
    let beforeOr = nameList.slice(0, -1).join(', ');
    return beforeOr + ', or ' + nameList[nameList.length-1];
};