"use strict"

function packResources(params) {
    const utils = require("./utils.js");

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    var projectGenerator = utils.requireGeneratorScript(context.generatorPath);
    projectGenerator.packResources(context);
}

module.exports.packResources = packResources;
