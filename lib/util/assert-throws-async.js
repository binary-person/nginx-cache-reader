'use strict';

const assert = require('assert');

// credit to https://stackoverflow.com/a/46957474/6850723
module.exports = async function assertThrowsAsync(fn, regExp) {
    let f = () => { };
    try {
        await fn();
    } catch (e) {
        f = () => { throw e };
    } finally {
        assert.throws(f, regExp);
    }

}