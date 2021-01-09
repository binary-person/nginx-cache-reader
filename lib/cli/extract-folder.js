'use strict';

const fs = require('fs');
const path = require('path');

const nginxCacheReader = require('../index');
const streamToFile = require('../util/stream-to-file');

module.exports.action = async function action(nginxcachefolder, extractfolder, cmdObj) {
    let parsedCacheFolder;
    let searchTerm = cmdObj.search;
    let suppressErrors = cmdObj.parent.suppressErrors;
    try {
        parsedCacheFolder = await nginxCacheReader.parseFolder(nginxcachefolder);
    } catch (e) {
        console.error(e.toString()); // prevent printing stack trace when parseFolder throws an error
        process.exit(1);
    }

    if (suppressErrors) {
        parsedCacheFolder = parsedCacheFolder.filter(item => !item.error);
    }
    if (searchTerm) {
        parsedCacheFolder = parsedCacheFolder.filter(item => item.error || item.key.includes(searchTerm));
    }

    if (!parsedCacheFolder.length) {
        console.error('No files copied');
        process.exit(1);
    }

    if(!fs.existsSync(extractfolder)){
        fs.mkdirSync(extractfolder);
    }
    for (let eachFile of parsedCacheFolder) {
        if (!eachFile.error) {
            console.log('Copying ' + eachFile.relativePath);
            await streamToFile(eachFile.body, path.join(extractfolder, path.basename(eachFile.relativePath)));
        } else {
            console.error('not an nginx cache file: ' + eachFile.relativePath);
        }
    }
};