"use strict"

const defaultConfigFileNameSubmodule = "default_submodule.json"

function findModules(context) {
    const path = require("path");
    const fs = require("fs");
    const utils = require(context.findFlappyScript("utils.js"));

    let modules = [];
    for (let i in context.config.modules) {
        const module = context.config.modules[i];
        let absolutePath = "";
        if (module.path.trim().indexOf("^/") == 0) {
            const modulePath = module.path.replace("^/", "");
            absolutePath = utils.absolutePath(context.projectRoot, "flappy_cache", context.config.name, modulePath);
            if (!fs.existsSync(absolutePath))
                continue;
        } else if (path.isAbsolute(module.path)) {
            absolutePath = module.path;
        } else {
            absolutePath = utils.absolutePath(context.moduleRoot, module.path);
        }
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
