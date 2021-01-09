'use strict';

const fs = require('fs');
const spawn = require('child_process').spawn;

const rmdirRecursiveSync = require('rmdir-recursive').sync;

module.exports.execArguments = ['./bin/nginx-cache-reader.js'];
module.exports.readfolder = require('./readfolder.cli');
module.exports.readfile = require('./readfile.cli');
module.exports.extractfile = require('./extractfile.cli');
module.exports.extractfolder = require('./extractfolder.cli');

/**
 * @param {function} func
 * @param {String} prefix
 * @returns {Promise<void>}
 */
module.exports.tempFolderSession = async function tempFolderSession(func, prefix=null){
    let tempFolder = fs.mkdtempSync(prefix);
    try {
        await func(tempFolder);
    }catch(e){
        rmdirRecursiveSync(tempFolder);
        throw e;
    }
    rmdirRecursiveSync(tempFolder);
};

/**
 * @param {string} command
 * @param {Array} args
 * @param {boolean} stdBuffer
 * @returns {Promise<{stdout:String|Buffer, stderr:String|Buffer, exitCode:Number}>}
 */
module.exports.asyncSpawn = function asyncSpawn(args = [], stdBuffer = false) {
    return new Promise(function (resolve, reject) {
        let spawnProcess = spawn('node', module.exports.execArguments.concat(args));
        let stdoutChunks = [];
        let stderrChunks = [];

        spawnProcess.stdout.on('data', function (chunk) {
            stdoutChunks.push(chunk);
        });
        spawnProcess.stderr.on('data', function (chunk) {
            stderrChunks.push(chunk);
        });
        spawnProcess.on('close', function (code) {
            resolve({
                stdout: stdBuffer ? Buffer.concat(stdoutChunks) : Buffer.concat(stdoutChunks).toString(),
                stderr: stdBuffer ? Buffer.concat(stderrChunks) : Buffer.concat(stderrChunks).toString(),
                exitCode: code
            });
        });
        spawnProcess.on('error', reject);
    });
};