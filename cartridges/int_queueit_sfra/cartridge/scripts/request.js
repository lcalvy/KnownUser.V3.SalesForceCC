'use strict';
exports.onRequest = function () {
    var queueIt = require('~/cartridge/scripts/QueueIt.js');
    queueIt.start();
};