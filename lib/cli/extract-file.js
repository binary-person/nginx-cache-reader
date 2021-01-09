'use strict';

const fs = require('fs');

const nginxCacheReader = require('../index');

module.exports.action = async function action(nginxcachefile, cmdObj) {
    let nginxCacheFileObject;
    try {
        nginxCacheFileObject = await nginxCacheReader.parseFile(nginxcachefile);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    if (cmdObj.output) {
        nginxCacheFileObject.body.pipe(fs.createWriteStream(cmdObj.output));
    } else {
        nginxCacheFileObject.body.pipe(process.stdout);
    }
};