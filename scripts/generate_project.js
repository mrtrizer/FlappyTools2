"use strict"

const path = require("path");

const defaultConfigFileName = "default.json"

function mergeConfig(projectRoot, generatorPath, defaultConfigFileName, configOrder, extraParams) {
    const utils = require("./utils.js");
    const path = require("path");

    const defaultConfig = utils.absolutePath(generatorPath, defaultConfigFileName); // template default config
    const generalConfig = utils.absolutePath(projectRoot, "flappy_conf/general.json"); // project default config

    let fullConfigOrder = [defaultConfig, generalConfig];


    for (let i in configOrder) {
        const config = configOrder[i];

        fullConfigOrder.push(path.join(projectRoot, "flappy_conf", config + ".json"));
    }

    console.log("ConfigOrder: " + JSON.stringify(fullConfigOrder));

    const merge_config = require("./merge_config.js")
    const config =  merge_config.parseJson(fullConfigOrder, extraParams);
    return config;
}

function normalize(path, projectRoot) {
    const utils = require("./utils.js");
    return utils.absolutePath(projectRoot, path);
}

function requireGeneratorScript(generatorPath) {
    return require(path.join(generatorPath, "generator.js"));
}

// Read file lists in directories recursively. Returns list of pathes.
function readDirs(root) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
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

// Check if file excluded
function isExcluded(projectRoot, absolutePath, excludes) {
    const path = require("path");

    const normalizedPath = path.normalize(absolutePath); 
    for (let excludedN in excludes) {
        const excluded = excludes[excludedN];
        const excludeAbsolute = path.join(projectRoot, excluded);
        const excludeNormalized = path.normalize(excludeAbsolute);
        if (normalizedPath.indexOf(excludeAbsolute) != -1)
            return true;
    }
    return false;
}

// Returns source file list considering excludes
function sourceList(projectRoot, sourceDirs, excludes) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    for (let sourceDirN in sourceDirs) {
        const sourceDir = sourceDirs[sourceDirN];
        const absoluteSourceDir = path.join(projectRoot, sourceDir)
        const fileList = readDirs(absoluteSourceDir);
        for (let filePathN in fileList) {
            const filePath = fileList[filePathN];
            if (!isExcluded(projectRoot, filePath, excludes))
                outList.push(filePath);
        }
    }
    return outList;
}

function findFlappyScript(name) {
    const path = require('path');
    const scriptPath = path.dirname(require.main.filename);
    return path.join(scriptPath, name);
}

function createContext(context, projectRoot, defaultConfigFileName) {
    const compile_dir = require("./compile_dir.js");

    const config = mergeConfig(
        projectRoot,
        context.generatorPath,
        defaultConfigFileName,
        context.configOrder,
        context.extraParams
    );

    const newContext = {
        "projectRoot": projectRoot,
        "config": config,
        "compileDir": compile_dir.compileDir,
        "generatorPath": context.generatorPath,
        "targetOutDir": context.targetOutDir,
        "normalize": path => normalize(path, projectRoot),
        "sourceList": sourceList,
        "configOrder": context.configOrder,
        "extraParams": context.extraParams,
        "findFlappyScript": findFlappyScript,
        "createContext": createContext
    };
    return newContext;
}

function generateProject(params) {
    const context = createContext(params, params.projectRoot, defaultConfigFileName);
    requireGeneratorScript(params.generatorPath).generate(context);
}

function buildProject(params) {
    const context = createContext(params, params.projectRoot, defaultConfigFileName);
    requireGeneratorScript(params.generatorPath).generate(context);
    requireGeneratorScript(params.generatorPath).build(context);
}

module.exports.generateProject = generateProject;
module.exports.buildProject = buildProject;
