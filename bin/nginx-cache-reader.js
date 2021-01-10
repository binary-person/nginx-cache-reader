#!/usr/bin/env node
'use strict';

const { Command, Option } = require('commander');
const nginxCacheReader = require('../lib/index');

const psjson = require('../package.json');
const readFolder = require('../lib/cli/read-folder');
const readFile = require('../lib/cli/read-file');
const extractFile = require('../lib/cli/extract-file');
const extractFolder = require('../lib/cli/extract-folder');

const program = new Command();

program
    .version(psjson.version, '-v, --version')
    .option('-q, --suppress-errors', 'Invalid cache files are ignored');

program
    .command('readfolder <nginxcachefolder>')
    .description('Displays each cache file info')
    .option('-l, --ordering <order>', 'List cache items by ' + readFolder.getOrderings(), readFolder.getOrderingDefault())
    .option('-r, --reverse', 'Reverses the ordering list')
    .option('-f, --format <format>', readFolder.getFormats(), readFolder.getFormatDefault())
    .option('-s, --search <searchterm>', 'limits to only cache files that match <searchterm>')
    .option('-o, --output <file>', 'Prints to stdout if unspecified')
    .action(readFolder.action);
program
    .command('readfile <nginxcachefile>')
    .description('Displays cache file info')
    .option('-f, --format <format>', readFile.getFormats(), readFile.getFormatDefault())
    .option('-o, --output <file>', 'Prints to stdout if unspecified')
    .action(readFile.action);
program
    .command('extractfile <nginxcachefile>')
    .description('Extracts body content of cache file')
    .option('-o, --output <file>', 'Prints to stdout if unspecified')
    .action(extractFile.action)
program
    .command('extractfolder <nginxcachefolder> <extractfolder>')
    .description('Extracts body content of all cache files to a folder')
    .option('-s, --search <searchterm>', 'limits to only cache files that match <searchterm>')
    .action(extractFolder.action);

program.parse(process.argv);