'use strict';

const path = require('path');

/**
 * @param {String} relativePath 
 * @returns {String} - absolute path
 */
module.exports = function getAbsolutePath(relativePath){
    return path.join(process.cwd(), relativePath);
};