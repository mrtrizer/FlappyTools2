#!/usr/bin/nodejs
"use strict"

const defaultConfigFileNameSubmodule = "default_submodule.json"

function findModules(context) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));

    let modules = [];
    for (let i in context.config.modules) {
        const module = context.config.modules[i];
        const absolutePath = utils.absolutePath(context.projectRoot, module.path);
        const moduleContext = context.createContext( context, absolutePath, defaultConfigFileNameSubmodule);
        modules.push(moduleContext);
    }
    return modules;
}

// Returns list of modules recursively
function findAllModules(context) {
    var list = findModules(context);
    var modules = findModules(context);
    for (let i in modules) {
        const module = modules[i];
        list = list.concat(findAllModules(module));
    }
    // Clean list of repeated modules
    var cleanResult = list.filter(function(item, pos, self) {
        const result = self.find((eItem, ePos) => eItem.config.name == item.config.name && ePos < pos) == undefined;
        return result;
    });
    return cleanResult;
}

module.exports.generate = function(context) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));

    // Full list of modules in project, recursively scanned.
    context.overallModules = findAllModules(context);
    // Iterate all modules in a project
    for (let i in context.overallModules) {
        const module = context.overallModules[i];
        module.modules = findModules(module);
        // Save outDir for module in it's context. The outDir is used later for references in project file.
        module.outDir = utils.absolutePath(context.targetOutDir, module.config.name);
        // Compile module template
        const templatePath = path.join(context.generatorPath, "cmake_module");
        context.compileDir(module, templatePath, module.outDir);
    }
    // List of modules included in project, non recursively.
    context.modules = findModules(context);
    // Compile project template
    const templatePath = path.join(context.generatorPath, "cmake_project");
    context.compileDir(context, templatePath, context.targetOutDir);

}

