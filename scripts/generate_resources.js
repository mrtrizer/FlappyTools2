"use strict"

const path = require("path");
const utils = require("./utils.js");
const fs = require("fs");
const res_utils = require("./res_utils.js");

function generateWithGenerators(config, generatorList, resSrcDir, cacheDir) {
    for (const i in generatorList) {
        const generator = generatorList[i];
        if ((generator.type == config.type) || (generator.type == "*"))
            generator.generate(config, resSrcDir, cacheDir);
    }
}

function generateResourcesInContext(context, generatorList, cacheDir) {
    let cacheSubDir = path.join(cacheDir, context.config.name);
    if (!fs.existsSync(cacheSubDir))
        fs.mkdirSync(cacheSubDir);

    let resSrcDir = path.join(context.projectRoot, "res_src");

    var resConfigList = res_utils.getListOfResConfigs(resSrcDir);
    for (let resConfigN in resConfigList) {
        generateWithGenerators(resConfigList[resConfigN], generatorList, resSrcDir, cacheSubDir)
    }
}

function generateResourcesInModules(context, generatorList) {
    const modules = require("./modules.js");

    let cacheDir = path.join(context.projectRoot, "flappy_cache");
    if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir);

    generateResourcesInContext(context, generatorList, cacheDir);

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        generateResourcesInContext(moduleContext, generatorList, cacheDir);
    }
}

function generateResources(params) {
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
    let generatorList = res_utils.getListOfGenerators(context);
    generateResourcesInModules(context, generatorList);
}

module.exports.generateResources = generateResources;
