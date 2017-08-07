"use strict"

const defaultConfigFileNameSubmodule = "default_submodule.json"

function findModulesRaw(projectRoot, modules) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));

    let modules = [];
    for (let i in modules) {
        const module = modules[i];
        const absolutePath = utils.absolutePath(projectRoot, module.path);
        const moduleConfig = mergeConfig
        modules.push(moduleContext);
    }
    return modules;
}

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

module.exports.findModules = findModules;
module.exports.findAllModules = findAllModules;
