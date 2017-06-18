#!/usr/bin/env node
"use strict"

function flappyInit(workingDir, templateName, projectName) {
    const path = require("path");
    const compileDir = require("./compile_dir.js");
    const utils = require("./utils");

    const outDir = path.join(workingDir, projectName)
    const extraParams = {"name": projectName};

    const config = utils.getFlappyConfig();
    const templatePath = utils.findTemplate(config, workingDir, templateName);

    compileDir.compileDir({"config": extraParams}, templatePath, outDir);
}

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const path = require("path");

    if (opt.argv.length < 2) {
        console.log("flappy init <template> <out dir>");
        return;
    }

    const templateName = opt.argv[0];
    const projectName = opt.argv[1];

    const workingDir = process.cwd();

    flappyInit(workingDir, templateName, projectName);
}
