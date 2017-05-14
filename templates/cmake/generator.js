#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");

    const templateDir = path.join(context.templatePath, "cmake_project");
    console.log(templateDir);
    context.compileDir(context, templateDir, context.outDir);

    // Generate subprojects
    for (let i in context.modules) {
        const module = context.modules[i];

        const moduleTemplateDir = path.join(context.templatePath, "cmake_module");
        const moduleOutDir = path.join(context.outDir, "/modules/", module.name);
        const moduleContext = context.createSubContext(module.path, moduleTemplateDir, moduleOutDir);
        context.compileDir(moduleContext, moduleTemplateDir, moduleOutDir);
    }
}

