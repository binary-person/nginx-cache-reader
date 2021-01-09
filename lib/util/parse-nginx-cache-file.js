'use strict';

const fs = require('fs');
const path = require('path');

const parseHeaders = require('parse-headers');

const arrayToString = require('./array-to-string');
const StreamFind = require('./stream-find');
const parseRawHTTPStatus = require('./parse-raw-http-status');
const getAbsolutePath = require('./get-absolute-path');

const NUL = 0x0;
const CARRIAGE_RETURN = 0xd;
const NEWLINE = 0xa;

const ANCHOR_KEY_BYTES = new Uint8Array([NUL, NUL, NUL, NEWLINE, 75, 69, 89, 58, 32]); // "...\nKEYS: ";
const KEY_HTTP_STATUS_SEPARATOR = new Uint8Array([NEWLINE]); // "\n"
const HTTP_STATUS_HEADER_SEPARATOR = new Uint8Array([CARRIAGE_RETURN, NEWLINE]); // "\r\n"
const HTTP_HEADER_END_BYTES = new Uint8Array([CARRIAGE_RETURN, NEWLINE, CARRIAGE_RETURN, NEWLINE]); // "\r\n\r\n"

/**
 * @typedef {Object} nginxCacheFile
 * @property {string} key
 * @property {number} statusCode
 * @property {Object} headers
 * @property {fs.ReadStream} body
 * @property {string} rawHTTPStatus
 * @property {string} rawHeaders
 * @property {string} relativePath
 * @property {string} absolutePath
 * @property {number} size - in bytes of the entire cache file
 * @property {Date} ctime
 * @property {Date} mtime
 * @property {Date} atime
 */

/**
 * @param {string} cacheFilePath
 * @param {number} highWaterMark
 * @returns {Promise<nginxCacheFile>}
 */
module.exports = function parseNginxCacheFile(cacheFilePath, highWaterMark = 64 * 1024) {
    return new Promise(function (resolve, reject) {
        const throwInvalidNginxFile = function (errMsg) {
            reject('Invalid nginx cache file: ' + errMsg);
        };

        let fileInfo = fs.statSync(cacheFilePath);
        let fileStream = fs.createReadStream(cacheFilePath, { highWaterMark });
        fs.utimesSync(cacheFilePath, fileInfo.atime, fileInfo.mtime);

        let keyAnchor = new StreamFind(fileStream, ANCHOR_KEY_BYTES, false, false);
        keyAnchor.on('match', async function (stream) {
            let keyGrabber = new StreamFind(stream, KEY_HTTP_STATUS_SEPARATOR, true, false, false);
            let keyGrabbed = await keyGrabber.async();
            if (!keyGrabbed.match) {
                return throwInvalidNginxFile('cannot find key http_status separator');
            }
            let key = arrayToString(keyGrabbed.savedBuffer);

            let httpStatusGrabber = new StreamFind(keyGrabbed.stream, HTTP_STATUS_HEADER_SEPARATOR, true, false, false);
            let httpStatusGrabbed = await httpStatusGrabber.async();
            if (!httpStatusGrabbed.match) {
                return throwInvalidNginxFile('cannot find http_status http_header separator');
            }
            let rawHTTPStatus = arrayToString(httpStatusGrabbed.savedBuffer);

            let httpHeaderGrabber = new StreamFind(httpStatusGrabbed.stream, HTTP_HEADER_END_BYTES, true, false, false);
            let httpHeaderGrabbed = await httpHeaderGrabber.async();
            if (!httpHeaderGrabbed.match) {
                return throwInvalidNginxFile('cannot find terminating end of http header');
            }
            let rawHeaders = arrayToString(httpHeaderGrabbed.savedBuffer);

            resolve({
                key,
                statusCode: parseRawHTTPStatus(rawHTTPStatus),
                headers: parseHeaders(rawHeaders),
                body: httpHeaderGrabbed.stream,
                rawHTTPStatus,
                rawHeaders,
                relativePath: cacheFilePath,
                absolutePath: getAbsolutePath(cacheFilePath),
                size: fileInfo.size,
                ctime: fileInfo.ctime,
                mtime: fileInfo.mtime,
                atime: fileInfo.atime
            });
        });
        keyAnchor.on('nomatch', function () {
            throwInvalidNginxFile('cannot find nginx key anchor');
        });
    });
};