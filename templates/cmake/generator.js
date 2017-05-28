#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");

    const overallModules = context.findAllModules(context);

    context.overallModules = overallModules;

    const templateDir = path.join(context.templatePath, "cmake_project");
    console.log(templateDir);
    context.compileDir(context, templateDir, context.outDir);

    // Generate CMake subprojects
    for (let i in overallModules) {
        const module = overallModules[i];

        const moduleContext = context.createSubContext(module.path, "default_submodule.json", module.outDir);
        const moduleTemplateDir = path.join(context.templatePath, "cmake_module");
        context.compileDir(moduleContext, moduleTemplateDir, module.outDir);
    }
}

