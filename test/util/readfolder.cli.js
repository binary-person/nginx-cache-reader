'use strict';

const fixtures = require('../fixtures/fixtures');

module.exports.validNginxCacheFolder = fixtures.validNginxCache;
module.exports.cliArguments = ['readfolder', module.exports.validNginxCacheFolder];
module.exports.validateResponse = function validateResponse(response){
    if(response.exitCode){
        throw 'unexpected exit code ' + exitCode;
    }
    if(Array.from(response.stdout.matchAll(/Key: http:\/\/127.0.0.1:1935/g)).length !== 3){
        throw 'expected there to be 3 occurrences of "Key: http://127.0.0.1:1935" but stdout is ' + response.stdout;
    }
    if(response.stderr){
        throw 'expected stderr to contain nothing, instead, contains ' + response.stderr;
    }
};