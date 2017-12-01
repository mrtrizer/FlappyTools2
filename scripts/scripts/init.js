#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy init <template> <project name>";
}

function flappyInit(context, workingDir, templateName, projectName) {
    const path = require("path");
    const compileDir = context.require("./compile_dir.js");
    const utils = context.require("./utils");

    const outDir = path.join(workingDir, projectName)
    const extraParams = {"name": projectName};

    const config = utils.getFlappyConfig();
    const templatePath = utils.findTemplate(config, workingDir, templateName);

    compileDir.compileDir({"config": extraParams}, templatePath, outDir);
}

function run(context, args) {
    if (args < 2)
        throw new Error("template and project name expected");
    const templateName = opt.argv[0];
    const projectName = opt.argv[1];

    const workingDir = process.cwd();

    flappyInit(context, workingDir, templateName, projectName);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
