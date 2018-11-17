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
            const parsedScriptPath = path.parse(scriptPath);
            if ((parsedScriptPath.ext == ".js") && (scriptPath.indexOf("node_modules") == -1)) {
                let script = require(scriptPath);
                script.path = scriptPath;
                if (scriptMap.hasOwnProperty(parsedScriptPath.name))
                    script.parentScript = scriptMap[parsedScriptPath.name];
                scriptMap[parsedScriptPath.name] = script;
            }
        }
    }
    return scriptMap;
}

function requireFlappyScript(scriptMap, scriptName) {
    const logger = require("./logger.js");
    if (scriptMap.hasOwnProperty(scriptName)) {
        return scriptMap[scriptName];
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

function findProjectSearchDirs(context) {
    const modules = require("./modules.js");

    const projectSearchDirs = [];
    const projectModules = modules.findAllModules(context);
    for (const i in projectModules) {
        const module = projectModules[i];
        projectSearchDirs.push(module.moduleRoot);
    }
    projectSearchDirs.push(context.projectRoot);
    return projectSearchDirs;
}

function getAdditionalScripts(scriptMap, scriptName) {
    let scriptObjects = [];
    for (const key in scriptMap) {
        const script = scriptMap[key];
        if (Array.isArray(script.before)) {
            if (script.before.indexOf(scriptName) != -1) {
                scriptObjects = scriptObjects.concat(getRequiredScripts(scriptMap, key));
            }
        }
    }
    return scriptObjects;
}

// The function returns list of scripts market "before" and scripts, listed in "after" array
// It will not return scripts which point to scriptName in "after" array.
function getRequiredScripts(scriptMap, scriptName) {
    const script = scriptMap[scriptName];
    let scriptObjects = [];
    if (Array.isArray(script.after)) {
        const requirements = script.after;
        for (const key in scriptMap) {
            if (requirements.indexOf(key) != -1) {
                scriptObjects = scriptObjects.concat(getRequiredScripts(scriptMap, key));
            }
        }
    }
    scriptObjects = scriptObjects.concat(getAdditionalScripts(scriptMap, scriptName));
    scriptObjects.push({"name": scriptName, "script": script});
    return scriptObjects;
}

function printScripts(scriptObjects, selectedScriptName) {
    const colors = require('colors');
    let str = "[start]";
    for (const i in scriptObjects) {
        const scriptName = scriptObjects[i].name;
        if (selectedScriptName == scriptName)
            str += " >> " + colors.yellow(scriptName);
        else
            str += " >> " + scriptName;
    }
    console.log(str);
}

function runFlappyScript(context, scriptMap, scriptName, methodName) {
    const requiredScripts = getRequiredScripts(scriptMap, scriptName);
    for (const i in requiredScripts) {
        const script = requiredScripts[i].script;
        const scriptName = requiredScripts[i].name;
        printScripts(requiredScripts, scriptName);
        if (typeof script[methodName] === "function")
            script[methodName](context, context.args.plainArgs);
    }
}

function createGlobalContext(args, customPlainArgs) {
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
    const customArgs = Object.assign({}, args, {"plainArgs": customPlainArgs});

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
    context["args"] = customArgs;
    context["scriptMap"] = scriptMap;
    context["requireFlappyScript"] = scriptName => requireFlappyScript(scriptMap, scriptName)
    context["runFlappyScript"] = (scriptName, methodName) => runFlappyScript(context, scriptMap, scriptName, methodName)
    return context;
}

function createModuleContext(globalContext, projectRoot, moduleRoot, configDirName) {
    const path = require("path");
    const mergeConfig = require("./merge_config.js");

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
    context["createModuleContext"] = (customModuleRoot, customConfigDirName) => createModuleContext(
                                                                    globalContext,
                                                                    projectRoot,
                                                                    customModuleRoot,
                                                                    customConfigDirName);
    context["normalize"] = pathStr => normalize(context, pathStr);
    return context;
}

function createProjectContext(moduleContext) {
    const modules = moduleContext.requireFlappyScript("modules");
    const searchDirs = moduleContext.searchDirs.concat(findProjectSearchDirs(moduleContext));
    const scriptMap = findScripts(searchDirs);

    const context = Object.assign({}, moduleContext);
    context["overallModules"] = modules.findAllModules(moduleContext);
    context["searchDirs"] = searchDirs;
    context["scriptMap"] = scriptMap;
    context["requireFlappyScript"] = scriptName => requireFlappyScript(scriptMap, scriptName)
    context["runFlappyScript"] = (scriptName, methodName) => runFlappyScript(context, scriptMap, scriptName, methodName)
    return context;
}

function createBuildContext(moduleContext, generatorPath, configDirName) {
    const path = require("path");
    const utils = moduleContext.requireFlappyScript("utils");
    const mergeConfig = moduleContext.requireFlappyScript("merge_config");

    const generatorDefaultConfig = path.join(generatorPath, "flappy_conf");
    const generatorConfigs = [generatorDefaultConfig];
    if (typeof configDirName === "string") {
        const generatorConfigOverride = path.join(generatorPath, configDirName);
        generatorConfigs.push(generatorConfigOverride);
    }
    const configPathOrder = utils.findConfigs(generatorConfigs, moduleContext.configOrder);
    const config = mergeConfig.parseJson(configPathOrder);

    mergeConfig.jsonIterate(moduleContext.config, config);
    mergeConfig.jsonIterate(moduleContext.extraParams, config);

    let context = Object.assign({}, moduleContext);
    context["config"] = config;
    context["generatorPath"] = generatorPath;
    context["targetOutDir"] = path.join(moduleContext.projectRoot, "generated", "cmake");
    context["sourceList"] = (sourceDirs, excludes) => utils.sourceList(context, sourceDirs, excludes)
    return context;
}

function installNodeModules(context, generatorsDirPath) {
    const utils = context.requireFlappyScript("utils");
    const path = require("path");

    const timestamp_cache = context.requireFlappyScript("timestamp_cache");
    const content = utils.readDirs(generatorsDirPath);
    const packageFiles = content.filter(item =>
        path.parse(item).base == "package.json" && item.indexOf("node_modules") == -1);
    let timestampCache = new timestamp_cache.TimestampCache(context);
    for (const i in packageFiles) {
        const packageFile = packageFiles[i];
        if (timestampCache.isChanged(packageFile)) {
            const packageDir = path.parse(packageFile).dir;
            const childProcess = require("child_process");
            const npmCommand = "npm install"
            childProcess.execSync(npmCommand, {"cwd": packageDir, stdio: "inherit"});
        }
    }
}

module.exports.defaultConfigFileName = "default.json";
module.exports.absolutePath = absolutePath;
module.exports.findProjectRoot = findProjectRoot;
module.exports.findConfigs = findConfigs;
module.exports.readDirs = readDirs;
module.exports.sourceList = sourceList;
module.exports.createGlobalContext = createGlobalContext;
module.exports.createModuleContext = createModuleContext;
module.exports.createProjectContext = createProjectContext;
module.exports.createBuildContext = createBuildContext;
module.exports.installNodeModules = installNodeModules;
