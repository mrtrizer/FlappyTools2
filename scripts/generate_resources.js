"use strict"

const path = require("path");
const utils = require("./utils.js");
const fs = require("fs");

function findGeneratorsInContext(context) {
    const generatorsDirPath = path.join(context.projectRoot, "generators");
    if (fs.existsSync(generatorsDirPath)) {
        const content = utils.readDirs(generatorsDirPath);
        const generatorFiles = content.filter(item => path.extname(item) == js);
        let generatorScripts = new Object();
        for (const i in generatorFiles) {
            const generatorFile = generatorFiles[i];
            const generatorScript = require(generatorFile);
            generatorScripts.push(generatorScript);
        }
        return generatorScripts;
    }
}

function getMapOfGenerators(context) {
    const modules = require("./modules.js");

    let generators = new Array();

    generators = generators.concat(findGeneratorsInContext(context));

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        generators.concat(findGeneratorsInContext(context));
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
        console.log(resConfigPath)
        try {
            const configData = fs.readFileSync(resConfigPath, "utf8");
            const flappyConfig = JSON.parse(configData);
            resConfigList.push(flappyConfig);
        } catch (e) {
            console.log(e.message);
        }
    }
    return resConfigList;
}

function generateResourcesInContext(context, generatorMap, cacheDir) {
    let cacheSubDir = path.join(cacheDir, context.config.name);
    if (!fs.existsSync(cacheSubDir))
        fs.mkdirSync(cacheSubDir);

    let resSrcDir = path.join(context.projectRoot, "res_src");

    var resConfigList = getListOfResConfigs(resSrcDir);

    for (let resConfigN in resConfigList) {
        generateWithGenerators(resConfigList[resConfigN], generatorMap, resSrcDir, cacheSubDir)
    }
}

function generateResourcesInModules(context, generatorMap) {
    const modules = require("./modules.js");

    let cacheDir = path.join(context.projectRoot, "flappy_cache");
    if (!fs.existsSync(cacheDir))
        fs.mkdirSync(cacheDir);

    generateResourcesInContext(context, generatorMap, cacheDir);

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        generateResourcesInContext(moduleContext, generatorMap, cacheDir);
    }
}

function generateWithGenerators(config, generatorList, resSrcDir, cacheDir) {
    for (const i in generatorList) {
        const generator = generatorList[i];
        if (generator.type == config.type)
            genrator.generate(config, resSrcDir, cacheDir);
    }
}

function generateResources(params) {
    const context = utils.createContext(params, params.projectRoot, "default.json");
    let generatorList = getMapOfGenerators(context);
    generateResourcesInModules(context, generatorList);
}

module.exports.generateResources = generateResources;
