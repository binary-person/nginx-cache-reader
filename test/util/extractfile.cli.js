'use strict';

const fs = require('fs');
const path = require('path');

const fixtures = require('../fixtures/fixtures');

let cacheFile = path.join(fixtures.validNginxCache, fixtures.testCacheFile);
let correctBufferCacheFile = path.join(fixtures.correctFileBuffers, fixtures.testCacheFile);
module.exports.cliArguments = ['extractfile', cacheFile];
module.exports.correctResponse = {
    stdout: fs.readFileSync(correctBufferCacheFile),
    stderr: Buffer.from(''),
    exitCode: 0
};