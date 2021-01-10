'use strict';

const fs = require('fs');
const path = require('path');

const json2csv = require('json2csv').parse;
const elapsedTime = require('../util/elapsed-locale');
const prettyBytes = require('pretty-bytes');

const nginxCacheReader = require('../index');
const objKeyToLocale = require('../util/object-key-to-locale-list');
const getAbsolutePath = require('../util/get-absolute-path');
const readFolder = require('./read-folder');

const defaultFormat = 'plain';

/**
 * @param {nginxCacheReader.nginxCacheFileObject} nginxCacheFile
 */
module.exports.fileCachePretty = function (nginxCacheFile) {
    let output = '';
    if (!nginxCacheFile.error) {
        output += 'Key: ' + nginxCacheFile.key + '\n';
        output += 'HTTP status: ' + nginxCacheFile.rawHTTPStatus + '\n';
        output += 'Size: ' + prettyBytes(nginxCacheFile.size) + '\n';
        output += 'Date created: ' + elapsedTime(nginxCacheFile.birthtime) + ' ago\n';
        output += 'Last modified: ' + elapsedTime(nginxCacheFile.mtime) + ' ago\n';
        output += 'Last accessed: ' + elapsedTime(nginxCacheFile.atime) + ' ago\n';
    } else {
        output += 'Invalid cache file\n';
    }
    output += 'Cache File Path: ' + nginxCacheFile.absolutePath;
    return output;
};

const formats = {
    'plain': function (nginxCacheFile) {
        return module.exports.fileCachePretty(nginxCacheFile);
    },
    'json': function (nginxCacheFile) {
        return JSON.stringify(nginxCacheFile);
    },
    'jsonformatted': function (nginxCacheFile) {
        return JSON.stringify(nginxCacheFile, null, 4);
    },
    'csv': function (nginxCacheFile) {
        return json2csv(nginxCacheFile);
    }
};

module.exports.getFormatDefault = function getFormatDefault() {
    if (!formats[defaultFormat]) throw 'Default format "' + defaultFormat + '" doesn\'t exist';
    return defaultFormat;
};
module.exports.getFormats = function getFormats() {
    return objKeyToLocale(formats);
};

module.exports.action = async function action(nginxcachefile, cmdObj) {
    let formatFunction = formats[cmdObj.format];

    if (!formatFunction) {
        console.error(cmdObj.format + ' is not a valid format option');
        process.exit(1);
    }

    let nginxCacheFileObject;
    try {
        nginxCacheFileObject = await nginxCacheReader.parseFile(nginxcachefile);
    } catch (e) {
        nginxCacheFileObject = {
            error: true,
            absolutePath: getAbsolutePath(nginxcachefile)
        };
    }
    readFolder.cleanNginxCacheFileObject(nginxCacheFileObject);

    let output = formatFunction(nginxCacheFileObject);
    if (cmdObj.output) {
        fs.writeFileSync(cmdObj.output, output, 'utf8');
    } else {
        console.log(output);
    }
};