"use strict"

function packResources(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
}

module.exports.packResources = packResources;
