"use strict"

function generateResources(params) {
    const utils = require("./utils.js");
    const res_utils = require("./res_utils.js");
    const fse = require("fs-extra");
    const path = require("path");

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    let cacheMetaMap = {};

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        const cacheMeta = generator.generate(context, config, resSrcDir, cacheDir);
        const name = config["_meta_name_"];
        cacheMetaMap[name] = cacheMeta;
    });

    const cacheMetaPath = path.join(res_utils.getCacheDir(context), "cache_meta.json");

    fse.writeJsonSync(cacheMetaPath, cacheMetaMap, {
        spaces: "    "
    });
}

module.exports.generateResources = generateResources;
