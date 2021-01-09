'use strict';

const fs = require('fs');
const path = require('path');

const json2csv = require('json2csv').parse;

const nginxCacheReader = require('../index');
const objKeyToLocale = require('../util/object-key-to-locale-list');
const readFile = require('./read-file');

const defaultOrdering = 'directorylisting';
const defaultFormat = 'plain';
const collator = new Intl.Collator('en', {
    numeric: true,
    sensitivity: 'base'
});

const orderings = {
    'directorylisting': function () {
        return 0;
    },
    'key': function (a, b) {
        return collator.compare(a.key, b.key);
    },
    'size': function (a, b) {
        return a.size - b.size;
    },
    'datecreated': function (a, b) {
        return a.datecreated - b.datecreated;
    },
    'datemodified': function (a, b) {
        return a.datemodified - b.datemodified;
    },
    'dateaccessed': function (a, b) {
        return a.dateaccessed - b.dateaccessed;
    }
};

const formats = {
    'plain': function (nginxCacheFolder) {
        let output = '';

        let elapsed = function () { };
        for (let eachFile of nginxCacheFolder) {
            output += readFile.fileCachePretty(eachFile);
            output += '\n\n';
        }

        return output.slice(0, -2);
    },
    'plaintop': function (nginxCacheFolder, totalFiles, totalSize) {
        return generatePlainFormatStats(totalFiles, totalSize) + '\n\n' + formats.plain(nginxCacheFolder);
    },
    'plainbottom': function (nginxCacheFolder, totalFiles, totalSize) {
        return formats.plain(nginxCacheFolder) + '\n\n' + generatePlainFormatStats(totalFiles, totalSize);
    },
    'json': function (nginxCacheFolder) {
        return JSON.stringify(nginxCacheFolder);
    },
    'jsonformatted': function (nginxCacheFolder) {
        return JSON.stringify(nginxCacheFolder, null, 4);
    },
    'csv': function (nginxCacheFolder) {
        return json2csv(nginxCacheFolder);
    }
};


module.exports.getOrderings = function getOrderings() {
    return objKeyToLocale(orderings);
};
module.exports.getFormats = function getFormats() {
    return objKeyToLocale(formats);
};
module.exports.getOrderingDefault = function getOrderingDefault() {
    if (!orderings[defaultOrdering]) throw 'Default ordering "' + defaultOrdering + '" doesn\'t exist';
    return defaultOrdering;
};
module.exports.getFormatDefault = function getFormatDefault() {
    if (!formats[defaultFormat]) throw 'Default format "' + defaultFormat + '" doesn\'t exist';
    return defaultFormat;
};

module.exports.cleanNginxCacheFileObject = function cleanNginxCacheFileObject(nginxFileCacheObject){
    if (!nginxFileCacheObject.error) {
        delete nginxFileCacheObject.headers;
        nginxFileCacheObject.body.destroy();
        delete nginxFileCacheObject.body;
        delete nginxFileCacheObject.rawHeaders;
        delete nginxFileCacheObject.relativePath;
    }
}

module.exports.action = async function action(nginxcachefolder, cmdObj) {
    if (!fs.existsSync(nginxcachefolder)) {
        console.error(nginxcachefolder + ' does not exist');
        process.exit(1);
    }
    if (fs.lstatSync(nginxcachefolder).isFile()) {
        console.error(nginxcachefolder + ' is a file');
        process.exit(1);
    }

    let suppressErrors = cmdObj.parent.suppressErrors;
    let searchTerm = cmdObj.search;
    let orderingFunction = orderings[cmdObj.ordering];
    let formatFunction = formats[cmdObj.format];
    let totalFiles = 0;
    let totalSize = 0;

    if (!orderingFunction) {
        console.error(cmdObj.ordering + ' is not a valid ordering option');
        process.exit(1);
    }
    if (!formatFunction) {
        console.error(cmdObj.format + ' is not a valid format option');
        process.exit(1);
    }

    let parsedCacheFolder = await nginxCacheReader.parseFolder(nginxcachefolder);

    if (suppressErrors) {
        parsedCacheFolder = parsedCacheFolder.filter(item => !item.error);
    }
    if (searchTerm) {
        parsedCacheFolder = parsedCacheFolder.filter(item => item.error || item.key.includes(searchTerm));
    }
    parsedCacheFolder = parsedCacheFolder.sort(orderingFunction);
    if (cmdObj.reverse) {
        parsedCacheFolder.reverse();
    }
    for (let eachItem of parsedCacheFolder) {
        module.exports.cleanNginxCacheFileObject(eachItem);
        totalFiles++;
        totalSize += eachItem.size;
    }

    let output = formatFunction(parsedCacheFolder, totalFiles, totalSize);
    if (cmdObj.output) {
        fs.writeFileSync(cmdObj.output, output, 'utf8');
    } else {
        console.log(output);
    }
}