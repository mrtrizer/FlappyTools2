#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));
    const modules = require(context.findFlappyScript("modules.js"));

    // Get pathes of project and module template folders
    const moduleTemplatePath = path.join(context.generatorPath, "cmake_module");
    const projectTemplatePath = path.join(context.generatorPath, "cmake_project");

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];

        // Include nessesary parameters to module context and compile the template
        moduleContext.modules = modules.findModules(moduleContext);
        moduleContext.outDir = utils.absolutePath(context.targetOutDir, moduleContext.config.name);
        context.compileDir(moduleContext, moduleTemplatePath, moduleContext.outDir);
    }

    // Add nessary params to context and compile the template
    context.overallModules = allModulesContexts;
    context.modules = modules.findModules(context);
    context.compileDir(context, projectTemplatePath, context.targetOutDir);
}

module.exports.build = function(context) {
    function call(command, cwd) {
        const childProcess = require("child_process");
        console.log(childProcess.execSync(command, {"cwd": cwd}));
    }
    console.log("Project out dir: " + context.targetOutDir);
    call("cmake -G \"Unix Makefiles\"", context.targetOutDir);
    call("make", context.targetOutDir);
}

module.exports.packRes = function (context, res) {

}
