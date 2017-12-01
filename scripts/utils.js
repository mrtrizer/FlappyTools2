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

function findTemplate(templateDirs, projectRoot, name) {
    const fs = require("fs");
    const path = require('path');

    const scriptPath = path.dirname(require.main.filename);

    for (let i in templateDirs) {
        const templateDir = path.join(templateDirs[i], "templates");
        const generatorPath = absolutePath(templateDir, name);
        if (fs.existsSync(generatorPath))
            return generatorPath;
    }
    throw new Error("Can't find template.");
}

function getFlappyConfig() {
    const os = require("os");
    const fs = require("fs");
    const path = require("path");

    if (typeof os.homedir === "undefined") {
        throw new Error("Update nodejs. For proper work nodejs >= 4.0 required.");
    }

    const configFilePath = path.join(os.homedir(), ".config/flappy/config.json");
    if (!fs.existsSync(configFilePath)) {
        return {"template_dirs":[]};
    }
    const configData = fs.readFileSync(configFilePath, "utf8");
    const flappyConfig = JSON.parse(configData);
    return flappyConfig;
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

// Base context is the first creted context. It serves as a base for the rest contexts,
// like module context, generation context and custom contexts.
function createContext(projectRoot, moduleRoot, configOrder, configDirName, extraParams) {
    const path = require("path");
    const mergeConfig = require("./merge_config.js");
    const homedir = require("homedir");

    const flappyHomeDir = path.join(homedir(), ".flappy");
    const flappyHomeDirConfig = path.join(flappyHomeDir, configDirName);
    const configDir = path.join(moduleRoot, "flappy_conf");
    const configDirs = [flappyHomeDirConfig, configDir]
    const configPathOrder = findConfigs(configDirs, configOrder);

    const config = mergeConfig.parseJson(configPathOrder, extraParams);
    const cacheDir = path.join(projectRoot, "flappy_cache", config.name);
    const flappyToolsRoot = path.join(__dirname, "..");

    const newContext = {};
    newContext["moduleRoot"] = moduleRoot;
    newContext["projectRoot"] = projectRoot;
    newContext["cacheDir"] = cacheDir;
    newContext["configDir"] = configDir;
    newContext["config"] = config;
    newContext["configOrder"] = configOrder;
    newContext["extraParams"] = extraParams;
    newContext["require"] = require;
    newContext["templateDirs"] = [flappyToolsRoot, flappyHomeDir, projectRoot];
    newContext["createContext"] = (customModuleRoot, customConfigDirName) => createContext(
                                                                    projectRoot,
                                                                    customModuleRoot,
                                                                    configOrder,
                                                                    customConfigDirName,
                                                                    extraParams);
    newContext["flappyToolsRoot"] = flappyToolsRoot;
    newContext["flappyHomeDir"] = flappyHomeDir;
    newContext["normalize"] = pathStr => normalize(newContext, pathStr);
    return newContext;
}

function createBuildContext(context, generatorPath, configDirName) {
    const path = require("path");
    const utils = context.require("./utils.js");
    const mergeConfig = context.require("./merge_config.js");

    let buildContext = Object.assign({}, context);
    const configDirs = [
        path.join(generatorPath, configDirName),
        path.join(generatorPath, configDirName),
        context.configDir];
    const configPathOrder = utils.findConfigs(configDirs, context.configOrder);
    const config = mergeConfig.parseJson(configPathOrder, context.extraParams);
    buildContext["config"] = config;
    buildContext["generatorPath"] = generatorPath;
    buildContext["targetOutDir"] = path.join(context.projectRoot, "generated", "cmake");
    buildContext["sourceList"] = (sourceDirs, excludes) => utils.sourceList(buildContext, sourceDirs, excludes)
    return buildContext;
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
module.exports.getFlappyConfig = getFlappyConfig;
module.exports.requireGeneratorScript = requireGeneratorScript;
module.exports.readDirs = readDirs;
module.exports.sourceList = sourceList;
module.exports.createContext = createContext;
module.exports.createBuildContext = createBuildContext;
