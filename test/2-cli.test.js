'use strict';

const fs = require('fs');
const assert = require('assert');

const assertDirEqual = require('assert-dir-equal');

const cli = require('./util/cli');

describe('Nginx Cache Reader Cli', function () {
    describe('readfolder command', function(){
        it('reads folder and prints to stdout correctly', async function(){
            let result = await cli.asyncSpawn(cli.readfolder.cliArguments);
            cli.readfolder.validateResponse(result);
        });
    });
    describe('readfile command', function(){
        it('reads file and prints to stdout correctly', async function(){
            let result = await cli.asyncSpawn(cli.readfile.cliArguments);
            cli.readfile.validateResponse(result);
        });
    });
    describe('extractfile command', function(){
        it('extracts file to stdout correctly', async function(){
            let result = await cli.asyncSpawn(cli.extractfile.cliArguments, true);
            assert.deepStrictEqual(result, cli.extractfile.correctResponse);
        });
    });
    describe('extractfolder command', function () {
        it('extracts valid nginx cache folder to a folder correctly', async function () {
            await cli.tempFolderSession(async function(tempFolder){
                let result = await cli.asyncSpawn(cli.extractfolder.generateArguments(tempFolder));
                assert.deepStrictEqual(result, cli.extractfolder.correctResponse);
                assertDirEqual(tempFolder, cli.extractfolder.correctExtractedFolder);
            }, 'extractfolder-');
        });
    });
});