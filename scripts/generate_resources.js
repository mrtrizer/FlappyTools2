"use strict"

function generateResources(params) {
    const utils = require("./utils.js");
    const res_utils = require("./res_utils.js");

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        generator.generate(config, resSrcDir, cacheDir);
    });
}

module.exports.generateResources = generateResources;
