"use strict"

// Converts relative pathes to absolute normalized pathes
function absolutePath () {
        const path = require("path");
        return path.normalize(path.join.apply(path, arguments));
}

function findProjectRoot(workingDir) {
    const fs = require("fs");
    const path = require("path");

    let currentDir = workingDir;
    let nextDir = workingDir;
    do {
        currentDir = nextDir;
        if (fs.existsSync(path.join(currentDir, "flappy_conf")))
            return currentDir;
        nextDir = path.normalize(path.join(currentDir, ".."));
    } while (currentDir != nextDir);

    throw new Error("Can't find project root");
}

function findTemplate(searchDirs, name) {
    const fs = require("fs");
    const path = require('path');

    const scriptPath = path.dirname(require.main.filename);

    for (let i in searchDirs) {
        const templateDir = path.join(searchDirs[i], "templates");
        const generatorPath = absolutePath(templateDir, name);
        if (fs.existsSync(generatorPath))
            return generatorPath;
    }
    throw new Error("Can't find template.");
}

function requireGeneratorScript(generatorPath) {
    const path = require("path");
    return require(path.join(generatorPath, "generator.js"));
}

// Read file lists in directories recursively. Returns list of pathes.
function readDirs(root) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    if (!fs.existsSync(root))
        return outList;
    const fileList = fs.readdirSync(root);
    for (let filePathN in fileList) {
        const filePath = fileList[filePathN];
        const absoluteFilePath = path.join(root, filePath);
        const stat = fs.lstatSync(absoluteFilePath);
        if (stat.isDirectory())
            outList = outList.concat(readDirs(absoluteFilePath));
        else
            outList.push(absoluteFilePath);
    }
    return outList;
}

function findConfigs(dirs, configOrder) {
    const utils = require("./utils.js");
    const path = require("path");

    const fullConfigOrder = ["general"].concat(configOrder);
    let configPathOrder = [];
    for (let i in dirs) {
        const dir = dirs[i];
        for (let j in fullConfigOrder) {
            const config = fullConfigOrder[j];
            configPathOrder.push(path.join(dir, config + ".json"));
        }
    }
    return configPathOrder;
}

function normalize(context, pathStr) {
    const utils = require("./utils.js");
    const path = require("path");
    if (pathStr.trim().indexOf("^/") == 0) {
        const cacheRelativePath = pathStr.replace("^/", "");
        return utils.absolutePath(context.projectRoot, "flappy_cache", context.config.name, cacheRelativePath);
    } else if (path.isAbsolute(pathStr)) {
        return pathStr;
    } else {
        return utils.absolutePath(context.moduleRoot, pathStr);
    }
}

// Check if file excluded
function isExcluded(context, absolutePath, excludes) {
    const path = require("path");

    const normalizedPath = path.normalize(absolutePath);
    for (let excludedN in excludes) {
        const excluded = excludes[excludedN];
        const excludeAbsolute = normalize(context, excluded);
        if (normalizedPath.indexOf(excludeAbsolute) != -1)
            return true;
    }
    return false;
}

// Returns source file list considering excludes
function sourceList(context, sourceDirs, excludes) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    for (let sourceDirN in sourceDirs) {
        const sourceDir = sourceDirs[sourceDirN];
        const absoluteSourceDir = normalize(context, sourceDir);
        const fileList = readDirs(absoluteSourceDir);
        for (let filePathN in fileList) {
            const filePath = fileList[filePathN];
            if (!isExcluded(context, filePath, excludes))
                outList.push(filePath);
        }
    }
    return outList;
}

function findScripts(searchDirs) {
    const path = require("path");

    let scriptMap = {};
    for (const i in searchDirs) {
        const scriptDir = path.join(searchDirs[i], "scripts");
        const scriptList = readDirs(scriptDir);
        for (const j in scriptList) {
            const scriptPath = scriptList[j];
            const scriptName = path.parse(scriptPath).name;
            scriptMap[scriptName] = scriptPath;
        }
    }
    return scriptMap;
}

function requireFlappyScript(scriptMap, scriptName) {
    const logger = require("./logger.js");
    if (scriptMap.hasOwnProperty(scriptName)) {
        return require(scriptMap[scriptName]);
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
        return {}
    }
}

function findSearchDirs(config, flappyToolsRoot, flappyHomeDir) {
    let searchDirs = [];
    searchDirs.push(flappyToolsRoot);
    if (typeof config.searchDirs == "object")
        for (const key in config.searchDirs)
            searchDirs.push(config.searchDirs[key]);
    searchDirs.push(flappyHomeDir);
    return searchDirs;
}

function createGlobalContext(args) {
    const path = require("path");
    const mergeConfig = require("./merge_config.js");
    const homedir = require("homedir");

    const workingDir = process.cwd();
    const flappyHomeDir = path.join(homedir(), ".flappy");
    const flappyToolsRoot = path.join(__dirname, "..");
    const flappyToolsRootConfig = path.join(flappyToolsRoot, "flappy_conf");
    const flappyHomeDirConfig = path.join(flappyHomeDir, "flappy_conf");
    const configDirs = [flappyToolsRootConfig, flappyHomeDirConfig];
    const configPathOrder = findConfigs(configDirs, args.configOrder);
    const config = mergeConfig.parseJson(configPathOrder, args.extraParams);
    const searchDirs = findSearchDirs(config, flappyToolsRoot, flappyHomeDir);
    const scriptMap = findScripts(searchDirs);

    const context = {};
    context["require"] = require;
    context["workingDir"] = workingDir;
    context["flappyHomeDir"] = flappyHomeDir;
    context["searchDirs"] = searchDirs;
    context["flappyToolsRoot"] = flappyToolsRoot;
    context["config"] = config;
    context["configDirs"] = configDirs;
    context["configOrder"] = args.configOrder;
    context["extraParams"] = args.extraParams;
    context["scriptMap"] = scriptMap;
    context["requireFlappyScript"] = scriptName => requireFlappyScript(scriptMap, scriptName)
    return context;
}

function createProjectContext(globalContext, projectRoot, moduleRoot, configDirName) {
    const path = require("path");
    const mergeConfig = require("./merge_config.js");
    const homedir = require("homedir");

    const moduleConfigDir = path.join(moduleRoot, "flappy_conf");
    const overrideConfigDir = path.join(projectRoot, "flappy_conf/override");
    const configDirs = globalContext.configDirs.concat([moduleConfigDir, overrideConfigDir]);
    const configPathOrder = findConfigs(configDirs, globalContext.configOrder);
    const config = mergeConfig.parseJson(configPathOrder, globalContext.extraParams);
    const cacheDir = path.join(projectRoot, "flappy_cache", config.name);
    const flappyToolsRoot = path.join(__dirname, "..");

    const context = Object.assign({}, globalContext);
    context["moduleRoot"] = moduleRoot;
    context["projectRoot"] = projectRoot;
    context["cacheDir"] = cacheDir;
    context["configDirs"] = configDirs;
    context["config"] = config;
    context["searchDirs"] =  globalContext.searchDirs.concat([projectRoot]);
    context["createProjectContext"] = (customModuleRoot, customConfigDirName) => createProjectContext(
                                                                    globalContext,
                                                                    projectRoot,
                                                                    customModuleRoot,
                                                                    customConfigDirName);
    context["normalize"] = pathStr => normalize(context, pathStr);
    return context;
}

function createBuildContext(projectContext, generatorPath, configDirName) {
    const path = require("path");
    const utils = projectContext.require("./utils.js");
    const mergeConfig = projectContext.require("./merge_config.js");

    const generatorDefaultConfig = path.join(generatorPath, "flappy_conf");
    const generatorConfigOverride = path.join(generatorPath, configDirName);
    const configDirs = [generatorDefaultConfig, generatorConfigOverride].concat(projectContext.configDirs);
    const configPathOrder = utils.findConfigs(configDirs, projectContext.configOrder);
    const config = mergeConfig.parseJson(configPathOrder, projectContext.extraParams);

    let context = Object.assign({}, projectContext);
    context["config"] = config;
    context["generatorPath"] = generatorPath;
    context["configDirs"] = configDirs;
    context["targetOutDir"] = path.join(projectContext.projectRoot, "generated", "cmake");
    context["sourceList"] = (sourceDirs, excludes) => utils.sourceList(context, sourceDirs, excludes)
    return context;
}

class TimestampCache {
    constructor(context) {
        const path = require('path');
        const fse = require('fs-extra');
        this.timestampCachePath = path.join(context.projectRoot, "flappy_cache/timestamps.json");
        try {
            this.timestamps = fse.readJsonSync(this.timestampCachePath);
        } catch (e) {
            this.timestamps = {};
        }
    }

    isChanged(path) {
        const fs = require('fs');
        const fse = require('fs-extra');
        const lastModifTime = Math.floor(fs.statSync(path).mtime);
        if (!(path in this.timestamps) || this.timestamps[path] != lastModifTime) {
            console.log(path + " - Changed : " + lastModifTime);
            this.timestamps[path] = lastModifTime;
            fse.outputJsonSync(this.timestampCachePath, this.timestamps, {spaces: 4});
            return true;
        }
        return false;
    }
}

module.exports.TimestampCache = TimestampCache;
module.exports.defaultConfigFileName = "default.json";
module.exports.absolutePath = absolutePath;
module.exports.findProjectRoot = findProjectRoot;
module.exports.findTemplate = findTemplate;
module.exports.findConfigs = findConfigs;
module.exports.requireGeneratorScript = requireGeneratorScript;
module.exports.readDirs = readDirs;
module.exports.sourceList = sourceList;
module.exports.createGlobalContext = createGlobalContext;
module.exports.createProjectContext = createProjectContext;
module.exports.createBuildContext = createBuildContext;
