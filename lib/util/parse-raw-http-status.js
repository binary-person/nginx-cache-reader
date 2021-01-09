'use strict';

/**
 * 
 * @param {String} rawHTTPStatus - Example: "HTTP/1.0 200 OK"
 * @returns {Number} - Input: "HTTP/1.0 200 OK", returns 200
 */
module.exports = function parseRawHTTPStatus(rawHTTPStatus){
    return parseInt(rawHTTPStatus.split(' ')[1]);
};