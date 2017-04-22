#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");
    context.compileDir(context.config, path.join(context.templatePath, "cmake_project"), context.outDir);
    // for (let i in context.config.modules) {
    //     let module = context.config.modules[i];
    //     let moduleConfig = context.mergeConfig(module.path, context.configOrder);
    //     context.compileDir("./cmake_module", moduleConfig, context.outDir + "/modules/" + module.name);
    // }
}

