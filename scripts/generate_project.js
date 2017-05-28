#!/usr/bin/node
"use strict"

const path = require("path");

function mergeConfig(projectRoot, templatePath, defaultConfigFileName, configOrder, extraParams) {
    const utils = require("./utils.js");

    const defaultConfig = utils.absolutePath(templatePath, defaultConfigFileName); // template default config
    const generalConfig = utils.absolutePath(projectRoot, "flappy_conf/general.json"); // project default config

    let fullConfigOrder = [defaultConfig, generalConfig];

    console.log(configOrder);

    for (let i in configOrder) {
        const config = configOrder[i];

        fullConfigOrder.push(utils.absolutePath(projectRoot, "flappy_conf", config));
    }

    const merge_config = require("./merge_config.js")
    const config =  merge_config.parseJson(fullConfigOrder, extraParams);
    console.log(config);
    return config;
}

function normalize(path, projectRoot) {
    const utils = require("./utils.js");
    return utils.absolutePath(projectRoot, path);
}

function findModules(projectRoot, outDir, config) {
    const utils = require("./utils.js");
    const path = require("path");

    let modules = [];
    for (let i in config.modules) {
        const module = config.modules[i];
        const absolutePath = utils.absolutePath(projectRoot, module.path);
        const relativeModuleOutDir = path.join("modules", module.name);
        const moduleOutDir = utils.absolutePath(outDir, relativeModuleOutDir);
        modules.push({"name":module.name, "path":absolutePath, "outDir": moduleOutDir});
    }
    return modules;
}

function run(templatePath, context) {
    const generator = require(path.join(templatePath, "generator.js"));
    generator.generate(context);
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

// Returns list of modules recursively
function findAllModules(context) {
    var list = context.modules;
    for (let i in context.modules) {
        const module = context.modules[i];
        const moduleContext = context.createSubContext(module.path, "default_submodule.json", module.outDir);
        list = list.concat(findAllModules(moduleContext));
    }
    return list.filter(function(item, pos, self) {
        const result = self.find((eItem, ePos) => eItem.name == item.name && ePos < pos) == undefined;
        return result;
    });
}
function createContext(templatePath, outDir, projectRoot, defaultConfigFileName, configOrder, extraParams) {
    const compile_dir = require("./compile_dir.js");

    const createSubContext = function(subprojectRoot, defaultConfigFileName, outDir) {
        return createContext(templatePath,
            outDir,
            subprojectRoot,
            defaultConfigFileName,
            configOrder,
            extraParams);
    }

    const config = mergeConfig(projectRoot, templatePath, defaultConfigFileName, configOrder, extraParams);
    const context = {
        "projectRoot": projectRoot,
        "config": config,
        "compileDir": compile_dir.compileDir,
        "templatePath": templatePath,
        "modules": findModules(projectRoot, outDir, config),
        "outDir": outDir,
        "createSubContext": createSubContext,
        "normalize": path => normalize(path, projectRoot),
        "sourceList": sourceList,
        "findAllModules": findAllModules
    }
    return context;
}

function generateProject(workingDir, templatePath, outDir, configOrder, projectRoot, extraParams) {
    if (projectRoot == null)
        projectRoot = workingDir;
    const context = createContext(templatePath, outDir, projectRoot, "default.json", configOrder, extraParams);
    run(templatePath, context)
}

module.exports.generateProject = generateProject;

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['t', 'template-dir=ARG', 'Template dir. Should contain generator.js.'],
        ['c', 'config=ARG+', 'Configuration.'],
        ['p', 'project-root=ARG', 'Project root. If not set, root dir will be used as root.']
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const utils = require("./utils.js");

    const workingDir = process.cwd();
    const templatePath = utils.absolutePath(workingDir, opt.options["template-dir"]);
    const outDir = utils.absolutePath(workingDir, opt.options["output-dir"]);
    const configOrder = utils.absolutePath(workingDir, opt.options["config"]);
    const projectRoot = null;
    if (opt.options.hasOwnProperty("project-root"))
        projectRoot = utils.absolutePath(workingDir, opt.options["project-root"]);
    generateProject(workingDir, templatePath, outDir, configOrder, projectRoot);
}

