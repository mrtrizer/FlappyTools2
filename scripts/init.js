#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy init <template> <project name> - Initialize new project with template.";
}

function flappyInit(globalContext, templateName, projectName) {
    const path = require("path");
    const compileDir = globalContext.requireFlappyScript("compile_dir");
    const utils = globalContext.require("./utils");
    const outDir = path.join(globalContext.workingDir, projectName);
    const searchDirs = [globalContext.flappyToolsRoot, globalContext.flappyHomeDir];
    const templatePath = utils.findTemplate(searchDirs, templateName);
    globalContext["config"].name = projectName;
    compileDir.compileDir(globalContext, templatePath, outDir);
}

function runGlobal(globalContext, args) {
    if (args.length < 2)
        throw new Error("template and project name expected");
    const templateName = args[0];
    const projectName = args[1];

    flappyInit(globalContext, templateName, projectName);
}

module.exports.runGlobal = runGlobal;
module.exports.getHelp = getHelp;
