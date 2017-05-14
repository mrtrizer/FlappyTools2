#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");

    context.compileDir(context, path.join(context.templatePath, "cmake_project"), context.outDir);
    // for (let i in context.modules) {
    //     let module = context.modules[i];
    //     let moduleConfig = context.mergeConfig(context.configOrder);
    //     let moduleOutDir = path.join(context.outDir, "/modules/", module.name);
    //     let moduleTemplateDir = path.join(context.templatePath, "cmake_module");
    //     context.compileDir(moduleConfig, moduleTemplateDir, moduleOutDir);
    // }
}

