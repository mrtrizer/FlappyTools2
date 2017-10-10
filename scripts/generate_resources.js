"use strict"

function generateResources(params) {
    const utils = require("./utils.js");
    const res_utils = require("./res_utils.js");
    const fse = require("fs-extra");
    const path = require("path");

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);

    let cacheMetaMap = {};

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        fse.mkdirsSync(cacheDir);
        const cacheMetaArray = generator.generate(context, config, resSrcDir, cacheDir);
        for (const i in cacheMetaArray) {
            const cacheMetaItem = cacheMetaArray[i];
            const name = cacheMetaItem["name"];
            cacheMetaMap[name] = cacheMetaItem;
        }
    });

    const cacheMetaPath = path.join(res_utils.getCacheDir(context), "cache_meta.json");

    fse.mkdirsSync(res_utils.getCacheDir(context));

    fse.writeJsonSync(cacheMetaPath, cacheMetaMap, {
        spaces: "    "
    });
}

module.exports.generateResources = generateResources;
