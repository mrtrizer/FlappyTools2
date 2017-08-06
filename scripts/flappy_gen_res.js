#!/usr/bin/env node
"use strict"

const utils = require("./utils.js");

const opt = require('node-getopt').create([
    ['o', 'output-dir=ARG', 'Output dir.'],
    ['h', 'help', 'Display this help.'],
])
.bindHelp()
.parseSystem();

if (opt.argv.length < 1) {
    console.log("flappy gen <template>");
    return;
}

const workingDir = process.cwd();
const projectRoot = utils.findProjectRoot(workingDir);

function getListOfResConfigs() {
    return [
        {
            "type":"test"
        }
    ];
}

function getMapOfGenerators() {
    return {
        "test": {
            "generate": function (config, cacheDir) {
            }
        }
    };
}
