'use strict';

const fs = require('fs');
const events = require('events');

/**
 * @callback matchEventCallback
 * @param {fs.ReadStream} stream - continued readstream point with match streamMatchInclusive
 * @param {Buffer} savedBuffer - if saveChunks is set to true, parameter
 * passes a Buffer of all chunks consumed by StreamFind. match saveChunkMatchInclusive
 */
/**
 * @typedef {["match" | "nomatch", matchEventCallback, ...any[]]} eventEmitters
 */
class StreamFind extends events.EventEmitter {
    /**
     * @param {fs.ReadStream} readStream
     * @param {Buffer} searchBuffer
     * @param {boolean} saveChunks
     * @param {boolean} streamMatchInclusive
     * @param {boolean} saveChunkMatchInclusive
     */
    constructor(readStream, searchBuffer, saveChunks = false, streamMatchInclusive = true, saveChunkMatchInclusive = false) {
        super();
        this.readStream = readStream;
        this.searchBuffer = new Uint8Array(searchBuffer);
        this.matchByteCount = 0;
        this.isMatching = false;
        this.finished = false;
        this.match = false;
        this.saveChunks = saveChunks;
        this.streamMatchInclusive = streamMatchInclusive;
        this.saveChunkMatchInclusive = saveChunkMatchInclusive;
        this.chunks = [];
        this.savedBuffer = null;

        this.readStream.resume();
        this.readStream.on('data', this.data);
        this.readStream.on('end', () => {
            if (!this.finished) {
                this.finished = true;
                this.savedBuffer = Buffer.concat(this.chunks)
                this.emit('nomatch', null, this.savedBuffer);
            }
        });
    }
    /**
     * @param {Buffer} chunk 
     */
    data = chunk => {
        if (this.finished) return;
        let uint8Chunk = new Uint8Array(chunk);
        let i;

        let saveChunk = () => {
            if (this.saveChunks) this.chunks.push(uint8Chunk.subarray(0, i + 1));
        };

        for (i = 0; i < uint8Chunk.length; i++) {
            if (!this.isMatching) {
                if (this.searchBuffer[0] === uint8Chunk[i]) {
                    this.matchByteCount = 1;
                    this.isMatching = true;
                }
            } else {
                if (this.searchBuffer[this.matchByteCount] === uint8Chunk[i]) {
                    this.matchByteCount++;
                } else {
                    i -= this.matchByteCount;
                    this.isMatching = false;
                }
            }
            if (this.matchByteCount === this.searchBuffer.length) {
                this.finished = true;
                this.match = true;
                this.readStream.removeListener('data', this.data);
                this.readStream.pause();
                saveChunk();
                if (i + 1 < uint8Chunk.length) {
                    this.readStream.unshift(uint8Chunk.subarray(i + 1)); // unshift remaining data into stream
                }
                if (this.streamMatchInclusive) {
                    this.readStream.unshift(this.searchBuffer); // unshift matching characters
                }
                if (this.saveChunkMatchInclusive) {
                    this.savedBuffer = Buffer.concat(this.chunks);
                } else {
                    this.savedBuffer = Buffer.concat(this.chunks).slice(0, -this.searchBuffer.length); // delete matching characters
                }
                this.emit('match', this.readStream, this.savedBuffer);
                return;
            }
        }
        saveChunk();
    }
    /**
     * @returns {Promise<{savedBuffer:Buffer, match:boolean, stream:fs.ReadStream}>} - returns a Promise that waits for StreamFind to finish searching.
     * Buffer will be null if saveChunks is set to false.
     */
    async() {
        return new Promise(resolve => {
            let listener = () => {
                resolve({
                    savedBuffer: this.savedBuffer,
                    match: this.match,
                    stream: this.readStream
                });
            };
            if (this.finished) {
                listener();
            } else {
                this.on('match', listener);
                this.on('nomatch', listener);
            }
        });
    }

    /**
     * @param {eventEmitters} args
     */
    on(...args) {
        super.on(...args);
    }
}
module.exports = StreamFind;