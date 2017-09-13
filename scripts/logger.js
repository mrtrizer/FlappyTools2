"use strict"

module.exports.loge = function(message) {
    const colors = require('colors');

    console.log(colors.red("[ERROR] ") + message);
}

module.exports.logw = function(message) {
    const colors = require('colors');

    console.log(colors.yellow("[WARNING] ") + message);
}

module.exports.logi = function(message) {
    const colors = require('colors');

    console.log(colors.green("[INFO] ") + message);
}
