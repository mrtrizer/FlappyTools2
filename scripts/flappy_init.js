#!/usr/bin/node --harmony
"use strict"

function flappyInit(workingDir, templateName, projectName) {
    const flappyGen = require("./flappy_gen.js");
    const path = require("path");

    const outDir = path.join(workingDir, projectName)
    const extraParams = {"projectName": projectName};

    flappyGen.flappyGenerate(workingDir, workingDir, templateName, outDir, [], extraParams);
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
