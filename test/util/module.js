const fs = require('fs');
const path = require('path');

const getAbsolutePath = require('../../lib/util/get-absolute-path');
const fixtures = require('../fixtures/fixtures');

exports.correctFileBuffersFolder = fixtures.correctFileBuffers;
exports.validNginxCacheFolder = fixtures.validNginxCache;
exports.invalidNginxCacheFolder = fixtures.invalidNginxCache;

exports.invalidCacheFile = fixtures.invalidCacheFile;

exports.testCacheFile = fixtures.testCacheFile;
let testCacheFileInfo = fs.statSync(path.join(exports.validNginxCacheFolder, exports.testCacheFile));
let testCacheFileInfoRelativePath = path.join(exports.validNginxCacheFolder, exports.testCacheFile);
exports.testCacheFileParsed = {
    key: 'http://127.0.0.1:1935/',
    statusCode: 200,
    headers: {
        server: 'SimpleHTTP/0.6 Python/3.7.5',
        date: 'Tue, 05 Jan 2021 22:39:38 GMT',
        'content-type': 'text/html; charset=utf-8',
        'content-length': '385'
    },
    body: fs.createReadStream(path.join(exports.correctFileBuffersFolder, exports.testCacheFile)),
    rawHTTPStatus: 'HTTP/1.0 200 OK',
    rawHeaders: 'Server: SimpleHTTP/0.6 Python/3.7.5\r\n' +
        'Date: Tue, 05 Jan 2021 22:39:38 GMT\r\n' +
        'Content-type: text/html; charset=utf-8\r\n' +
        'Content-Length: 385',
    relativePath: testCacheFileInfoRelativePath,
    absolutePath: getAbsolutePath(testCacheFileInfoRelativePath),
    size: 904,
    birthtime: testCacheFileInfo.birthtime,
    mtime: testCacheFileInfo.mtime,
    atime: testCacheFileInfo.atime
};

exports.generateErrorObject = function(relativePath){
    return {error: true, relativePath, absolutePath: getAbsolutePath(relativePath)};
};