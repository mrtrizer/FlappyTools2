"use strict"

const path = require("path");
const utils = require("./utils.js");
const fs = require("fs");

function getListOfResConfigs(resSrcDir) {
    if (!fs.existsSync(resSrcDir))
        return;
    const resConfigPathList = utils.readDirs(resSrcDir);
    let resConfigList = new Array();
    for (const i in resConfigPathList) {
        const resConfigPath = resConfigPathList[i];
        if (path.extname(resConfigPath) == ".meta") {
            try {
                const configData = fs.readFileSync(resConfigPath, "utf8");
                const resConfig = JSON.parse(configData);
                const metaPath = path.relative(resSrcDir, resConfigPath);
                const metaDir = path.parse(metaPath).dir;
                const metaName = path.join(metaDir, path.parse(metaPath).name);
                resConfig["name"] = metaName;

                resConfigList.push(resConfig);
            } catch (e) {
                const logger = require("./logger.js");
                logger.loge(e.message);
            }
        }
    }
    return resConfigList;
}

function installNodeModules(generatorsDirPath) {
    if (!fs.existsSync(generatorsDirPath))
        return;
    const content = utils.readDirs(generatorsDirPath);
    const packageFiles = content.filter(item =>
        path.parse(item).base == "package.json" && item.indexOf("node_modules") == -1);
    for (const i in packageFiles) {
        const packageFile = packageFiles[i];
        const packageDir = path.parse(packageFile).dir;
        const childProcess = require("child_process");
        const npmCommand = "npm install"
        childProcess.execSync(npmCommand, {"cwd": packageDir, stdio: "inherit"});
    }
}

function findGeneratorsInContext(context) {
    let generatorScripts = new Array();
    const generatorsDirPath = path.join(context.projectRoot, "generators");
    installNodeModules(generatorsDirPath);
    if (fs.existsSync(generatorsDirPath)) {
        const content = utils.readDirs(generatorsDirPath);
        const generatorFiles = content.filter(item =>
            path.extname(item) == ".js" && item.indexOf("node_modules") == -1);

        for (const i in generatorFiles) {
            const generatorFile = generatorFiles[i];
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

function iterateResourcesInContext(context, generatorList, cacheDir, callback) {
    const fse = require('fs-extra');

    const findGenerator = function (resConfig, resSrcDir, cacheSubDir) {
        const logger = require("./logger.js");
        let resultGenerator = null;
        for (const i in generatorList) {
            const generator = generatorList[i];
            if (generator.type == resConfig.type)
                resultGenerator = generator;
            if ((generator.type == "*") && (resultGenerator == null))
                resultGenerator = generator;
        }
        if (resultGenerator == null) {
            logger.loge("Can't find generator for " + resConfig.type);
        }
        return resultGenerator;
    }

    const cacheSubDir = path.join(cacheDir, context.config.name);
    const resSrcDir = path.join(context.projectRoot, "res_src");

    const resConfigList = getListOfResConfigs(resSrcDir);
    for (const i in resConfigList) {
        const resConfig = resConfigList[i];
        const generator = findGenerator(resConfig, resSrcDir, cacheSubDir);
        if (generator != null)
            callback(resConfig, generator, resSrcDir, cacheSubDir);
    }
}

function getCacheDir(context) {
    return path.join(context.projectRoot, "flappy_cache");
}

function iterateResourcesRecursive(context, callback) {
    const modules = require("./modules.js");

    const cacheDir = getCacheDir(context);
    const generatorList = getListOfGenerators(context);
    iterateResourcesInContext(context, generatorList, cacheDir, callback);

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (const i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        iterateResourcesInContext(moduleContext, generatorList, cacheDir, callback);
    }
}

module.exports.getListOfGenerators = getListOfGenerators;
module.exports.getListOfResConfigs = getListOfResConfigs;
module.exports.getCacheDir = getCacheDir;
module.exports.iterateResourcesRecursive = iterateResourcesRecursive;
