#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy gen_res";
}

function run(context, args) {
    const utils = context.require("./utils.js");
    const res_utils = context.require("./res_utils.js");
    const fse = context.require("fs-extra");
    const path = require("path");

    let cacheMetaMap = {};
    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        fse.mkdirsSync(cacheDir);
        const cacheMetaArray = generator.script.generate(context, generator.context, config, resSrcDir, cacheDir);
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

module.exports.run = run;
module.exports.getHelp = getHelp;
