"use strict"

const path = require("path");
const utils = require("./utils.js");
const fs = require("fs");

function findGeneratorsInContext(context) {
    let generatorScripts = new Array();
    const generatorsDirPath = path.join(context.projectRoot, "generators");
    console.log(generatorsDirPath);
    if (fs.existsSync(generatorsDirPath)) {
        const content = utils.readDirs(generatorsDirPath);
        const generatorFiles = content.filter(item => path.extname(item) == ".js");

        for (const i in generatorFiles) {
            const generatorFile = generatorFiles[i];
            console.log(generatorFile);
            const generatorScript = require(generatorFile);
            generatorScripts.push(generatorScript);
        }
    }
    return generatorScripts;
}

function getListOfGenerators(context) {
    const modules = require("./modules.js");

    let generators = findGeneratorsInContext(context);

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        generators = generators.concat(findGeneratorsInContext(moduleContext));
    }
    return generators;
}

function getListOfResConfigs(resSrcDir) {
    if (!fs.existsSync(resSrcDir))
        return;
    const resConfigPathList = utils.readDirs(resSrcDir);
    let resConfigList = new Array();
    for (const i in resConfigPathList) {
        const resConfigPath = resConfigPathList[i];
        if (path.extname(resConfigPath) == ".meta") {
            console.log(resConfigPath)
            try {
                const configData = fs.readFileSync(resConfigPath, "utf8");
                const flappyConfig = JSON.parse(configData);
                resConfigList.push(flappyConfig);
            } catch (e) {
                console.log(e.message);
            }
        }
    }
    return resConfigList;
}

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

    var resConfigList = getListOfResConfigs(resSrcDir);
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
    let generatorList = getListOfGenerators(context);
    generateResourcesInModules(context, generatorList);
}

module.exports.generateResources = generateResources;
