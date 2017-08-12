"use strict"

function packResources(params) {
    const path = require("path");
    const res_utils = require("./res_utils.js");
    const utils = require("./utils.js");
    const fse = require("fs-extra");

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    var resPath = path.join(context.targetOutDir, "resources");
    fse.mkdirsSync(resPath);

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        var projectGenerator = utils.requireGeneratorScript(context.generatorPath);
        projectGenerator.packRes(context, config, generator, resSrcDir, cacheDir);
    });
}

module.exports.packResources = packResources;
