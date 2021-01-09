'use strict';

const fs = require('fs');

/**
 * @param {fs.ReadStream} stream
 * @param {String} outputFilePath
 * @returns {Promise<void>}
 */
module.exports = function streamToFile(stream, outputFilePath){
    return new Promise(resolve=>{
        stream.pipe(fs.createWriteStream(outputFilePath));
        stream.on('end', resolve);
    });
};