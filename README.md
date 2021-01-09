nginx-cache-reader
==================

[![Build Status](https://travis-ci.com/binary-person/nginx-cache-reader.svg?branch=master)](https://travis-ci.com/github/binary-person/nginx-cache-reader)
![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000)
![Minimum node version](https://img.shields.io/badge/node->=12.x.x-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/github/license/binary-person/nginx-cache-reader)](https://github.com/binary-person/nginx-cache-reader/blob/master/LICENSE)

> parses nginx's cache folder and files

[![NPM](https://nodei.co/npm/nginx-cache-reader.png?global=true)](https://nodei.co/npm/nginx-cache-reader/)

This is a CLI client for quickly viewing nginx cache folder information. It can read keys from the cache folder and extract the contents of it.

This can also be used as a library. See [API](#api)

Prerequisites
-------------

- node >=12.x.x
- suggested that you enable strictatime for accurate `atime`. Read this [askubuntu post](https://askubuntu.com/questions/383401/why-does-not-the-atime-option-of-mount-always-update-atime-of-files-as-expected) for more info

Install
--------

```
npm install -g nginx-cache-reader
```

Usage
-----

```
nginx-cache-reader --help
Usage: nginx-cache-reader [options] [command]

Options:
  -v, --version                                               output the version number
  -q, --suppress-errors                                       Invalid cache files are ignored
  -h, --help                                                  display help for command

Commands:
  readfolder [options] <nginxcachefolder>                     Displays each cache file info
  readfile [options] <nginxcachefile>                         Displays cache file info
  extractfile [options] <nginxcachefile>                      Extracts body content of cache file
  extractfolder [options] <nginxcachefolder> <extractfolder>  Extracts body content of all cache files to a folder
  help [command]
```

API
---

```js
const nginxCacheReader = require('nginx-cache-reader');
```

## nginxCacheReader.parseFolder(nginxCacheFolder, throwError = false)

returns `Promise<Array<nginxCacheReader.nginxCacheFile>>`.

If one of the cache files is invalid, and `throwError` is false, the array element will hold `{error: true, relativePath, absolutePath}` instead.

## nginxCacheReader.parseFile(nginxCacheFile)

returns `Promise<nginxCacheReader.nginxCacheFile>`

## type nginxCacheReader.nginxCacheFile

```js
{
    key, // nginx key
    statusCode, // http status code. example: 200
    headers,// http headers. example: {'content-type': 'text/html'}
    body, // stream body of cache file. example usage: body.pipe(destination)
    rawHTTPStatus, // raw http status. example: "HTTP/1.0 200 OK"
    rawHeaders, // raw headers. example: "Content-type: text/html\r\nContent-Length: 100"
    relativePath, // relative path of process.cwd(). example: path_to_cachefile
    absolutePath, // absolute path. example: /path/to/cachefile
    size, // size of cache file
    ctime, // taken directly from fs.statSync(cacheFile)
    mtime, // same as above
    atime // same as above
}
```

API examples
------------

## Extracting body of cache file

```js
let cacheFile = await nginxCacheReader.parseFile('path_to_cache_file');
cacheFile.body.pipe(fs.createWriteStream('extracted'));
```

## Reading a cache folder

```js
let cacheFolder = await nginxCacheReader.parseFolder('path_to_cache_folder');
for (let eachFile of cacheFolder) {
    if (!eachFile.error) {
      console.log('Key: ' + eachFile.key);
    }
}
```

Tests
---------

```
npm test
```


* Github: [@binary-person](https://github.com/binary-person)

## Contributing

Contributions, issues and feature requests are welcome.

Feel free to check [issues page](https://github.com/binary-person/nginx-cache-reader/issues).

## Show your support

Consider giving a ⭐️ if this project helped you. Thank you.


## License

[MIT](https://github.com/binary-person/nginx-cache-reader/blob/master/LICENSE)