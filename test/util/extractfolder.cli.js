'use strict';

const fixtures = require('../fixtures/fixtures');

module.exports.correctExtractedFolder = fixtures.cliExtractFolder;
module.exports.validNginxCacheFolder = fixtures.validNginxCache;
module.exports.generateArguments = function(tempFolder){
    return ['extractfolder', module.exports.validNginxCacheFolder, tempFolder];
};

module.exports.correctResponse = {
    stdout: 'Copying test/fixtures/valid-nginx-cache/3/e0/db872917dc847f0f345e3e7eb75abe03\nCopying test/fixtures/valid-nginx-cache/8/77/9e0e5262456cbf8c0b9315a688bfa778\nCopying test/fixtures/valid-nginx-cache/f/df/47ecd8cce3338545d5bf539d64363dff\n',
    stderr: '',
    exitCode: 0
};