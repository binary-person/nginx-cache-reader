'use strict';

const path = require('path');

const currentFolder = 'test/fixtures/';

let getItemPath = function(item){
    return path.join(currentFolder, item);
};

module.exports = {
    validNginxCache: getItemPath('valid-nginx-cache'),
    invalidNginxCache: getItemPath('invalid-nginx-cache'),
    correctFileBuffers: getItemPath('correct-file-buffers'),
    cliExtractFolder: getItemPath('cli-extractfolder'),
    invalidCacheFile: 'fakefolder/fakefile',
    testCacheFile: 'f/df/47ecd8cce3338545d5bf539d64363dff'
};