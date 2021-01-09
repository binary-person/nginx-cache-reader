'use strict';

const fs = require('fs');
const path = require('path');

/**
 * fileTree will await if callback returns a promise
 * @param {String} folderPath
 * @param {Promise<function(String):void>} eachFileCallback
 */
module.exports = async function fileTree(folderPath, callback){
    let mainLoop = async function(currentFolder){
        let itemsInFolder = fs.readdirSync(currentFolder);
        for(let eachItem of itemsInFolder){
            let itemPath = path.join(currentFolder, eachItem);
            if(fs.lstatSync(itemPath).isDirectory()){
                await mainLoop(itemPath);
            }else{
                await callback(itemPath);
            }
        }
    };
    await mainLoop(folderPath);
};