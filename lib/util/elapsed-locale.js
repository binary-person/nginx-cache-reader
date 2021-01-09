'use strict';

const humanElapsed = require('human-elapsed');

/**
 * 
 * @param {Date} date 
 */
module.exports = function elapsedTime(date){
    return humanElapsed(Math.round((Date.now() - date.getTime()) / 1000));
};