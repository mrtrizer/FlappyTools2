#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));
    const modules = require(context.findFlappyScript("modules.js"));

    // Full list of modules in project, recursively scanned.
    context.overallModules = modules.findAllModules(context);
    // Iterate all modules in a project
    for (let i in context.overallModules) {
        const module = context.overallModules[i];
        module.modules = modules.findModules(module);
        // Save outDir for module in it's context. The outDir is used later for references in project file.
        module.outDir = utils.absolutePath(context.targetOutDir, module.config.name);
        // Compile module template
        const templatePath = path.join(context.generatorPath, "cmake_module");
        context.compileDir(module, templatePath, module.outDir);
    }
    // List of modules included in project, non recursively.
    context.modules = modules.findModules(context);
    // Compile project template
    const templatePath = path.join(context.generatorPath, "cmake_project");
    context.compileDir(context, templatePath, context.targetOutDir);
}

