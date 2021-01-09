'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const streamEqual = require('stream-equal');

const nginxCacheReader = require('../index');
const correctAnswers = require('./util/module');
const assertThrowsAsync = require('../lib/util/assert-throws-async');

describe('Nginx Cache Reader Module', function () {
    describe('nginxCacheReader.parseFile functionality', function () {
        let validCacheFilePath = path.join(correctAnswers.validNginxCacheFolder, correctAnswers.testCacheFile);
        let invalidCacheFilePath = path.join(correctAnswers.invalidNginxCacheFolder, correctAnswers.invalidCacheFile);

        it('parses a valid cache file correctly', async function () {
            let parsed = await nginxCacheReader.parseFile(validCacheFilePath);
            assert.deepStrictEqual(
                await streamEqual(parsed.body, correctAnswers.testCacheFileParsed.body), true, 'expected body streams to be equal');
            parsed.body = null;
            correctAnswers.testCacheFileParsed.body = null;
            assert.deepStrictEqual(parsed, correctAnswers.testCacheFileParsed);
        });
        it('throws an error with an invalid cache file correctly', async function () {
            await assertThrowsAsync(async function () {
                await nginxCacheReader.parseFile(invalidCacheFilePath)
            }, /Invalid nginx cache file: cannot find nginx key anchor/);
        });
    });
    describe('nginxCacheReader.parseFolder functionality', function () {
        it('streams body of cache files from a valid cache folder correctly', async function () {
            let files = await nginxCacheReader.parseFolder(correctAnswers.validNginxCacheFolder);
            assert.notDeepStrictEqual(files.length, 0, 'expected files[] to contain at least one file');
            for (let eachFile of files) {
                let correctFilePath = eachFile.relativePath.replace(correctAnswers.validNginxCacheFolder, correctAnswers.correctFileBuffersFolder);
                assert.deepStrictEqual(
                    await streamEqual(eachFile.body, fs.createReadStream(correctFilePath)), true, 'expected body streams to be equal');
            }
        });
        it('does not throw error and appends error object correctly', async function(){
            let files = await nginxCacheReader.parseFolder(correctAnswers.invalidNginxCacheFolder);
            let errorIndex = -1;
            for(let i = 0; i < files.length; i++){
                if(files[i].error){
                    errorIndex = i;
                    break;
                }
            }
            assert.notDeepStrictEqual(errorIndex, -1, 'expected nginx reader to find an error file');
            assert.deepStrictEqual(files[errorIndex], correctAnswers.generateErrorObject(files[errorIndex].relativePath));
        });
        it('throws an error when invalid file exists and throwError argument is set to true', async function(){
            await assertThrowsAsync(async function(){
                await nginxCacheReader.parseFolder(correctAnswers.invalidNginxCacheFolder, true);
            }, /Invalid nginx cache file: cannot find nginx key anchor/);
        });
    });
});