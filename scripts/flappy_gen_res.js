#!/usr/bin/env node
"use strict"

const utils = require("./utils.js");
const path = require("path");

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

function getListOfResConfigs(projectRoot) {
    return [
        {
            "type":"text",
            "srcPath":"test.json"
        }
    ];
}

function getMapOfGenerators() {
    return {
        "text": {
            "generate": function (config, resSrcDir, cacheDir) {
                const srcPath = path.join(resSrcDir, config.srcPath);
                const cachePath = path.join(cacheDir, config.srcPath);
                utils.copyFile(srcPath, cachePath)
            }
        }
    };
}

function generateWithGenerators(config, generatorMap, resSrcDir, cacheDir) {
    generatorMap[config.type].generate(config, resSrcDir, cacheDir);
}

let cacheDir = path.join(projectRoot, "flappy_cache");
if (!fs.existsSync(cacheDir)){
    fs.mkdirSync(cacheDir);
}
let resSrcDir = path.join(projectRoot, "res_src");
let generatorList = getMapOfGenerators();
var listOfResConfigs = getListOfResConfigs(projectRoot);
for (let resConfig in listOfResConfigs) {
    generateWithGenerators(resConfig, generatorList, resSrcDir, cacheDir)
}
