'use strict';

const fs = require('fs');
const path = require('path');

const fixtures = require('../fixtures/fixtures');

let cacheFile = path.join(fixtures.validNginxCache, fixtures.testCacheFile);
module.exports.cliArguments = ['readfile', cacheFile];
module.exports.validateResponse = function validateResponse(response){
    if(response.exitCode){
        throw 'unexpected exit code ' + response.exitCode + '. response: ' + JSON.stringify(response);
    }
    if(Array.from(response.stdout.matchAll(/Key: http:\/\/127.0.0.1:1935/g)).length !== 1){
        throw 'expected stdout to contain 1 occurrence of "Key: http://127.0.0.1:1935". response: ' + JSON.stringify(response);
    }
    if(response.stderr){
        throw 'expected stderr to contain nothing. response:  ' + JSON.stringify(response);
    }
};