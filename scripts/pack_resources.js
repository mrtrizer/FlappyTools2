"use strict"

function packResources(params) {
    const res_utils = require("./res_utils.js");
    const utils = require("./utils.js")

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        var projectGenerator = utils.requireGeneratorScript(context.generatorPath);
        projectGenerator.packRes(context, config, generator, resSrcDir, cacheDir);
    });
}

module.exports.packResources = packResources;
