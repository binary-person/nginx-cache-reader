'use strict';

const fs = require('fs');
const path = require('path');

const fileTree = require('./util/file-tree');
const parseNginxCacheFile = require('./util/parse-nginx-cache-file');
const getAbsolutePath = require('./util/get-absolute-path');

/**
 * @typedef {Object} nginxErrorObject
 * @property {Boolean} error - always true
 * @property {String} relativePath
 * @property {String} absolutePath
 */
/**
 * 
 * @typedef {parseNginxCacheFile.nginxCacheFile} nginxCacheFile
 */
/**
 * 
 * @typedef {nginxCacheFile|nginxErrorObject} nginxCacheFileObject
 */
/**
 * 
 * @typedef {Array<nginxCacheFileObject>} nginxCacheFolder
 */
/**
 * @param {String} cacheFolder - location of nginx cache folder. Can be a relative path
 * @param {Boolean} throwError - throw error if "Invalid nginx cache file: ..." is thrown
 * @returns {Promise<nginxCacheFolder>}
 */
module.exports.parseFolder = async function nginxCacheReader(cacheFolder, throwError = false) {
    let list = [];
    await fileTree(cacheFolder, async function (cacheFilePath) {
        try {
            list.push(await parseNginxCacheFile(cacheFilePath));
        } catch (e) {
            if (e.toString().startsWith('Invalid nginx cache file: ') && !throwError) {
                list.push({
                    error: true,
                    relativePath: cacheFilePath,
                    absolutePath: getAbsolutePath(cacheFilePath)
                });
                return;
            } else {
                throw e;
            }
        }
    });
    return list;
};

module.exports.parseFile = parseNginxCacheFile;