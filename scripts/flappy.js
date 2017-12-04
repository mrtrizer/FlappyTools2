#!/usr/bin/env node
"use strict"

const childProcess = require("child_process");
const path = require("path");
const homedir = require("homedir");
const utils = require("./utils.js");
const mergeConfig = require("./merge_config.js");
const logger = require("./logger.js");
const flappyArgs = require("./flappy_args.js");

function printGeneralHelp() {
    console.log("Options:");
    console.log("flappy --help - Print help message");
}

function printScriptsHelp(scriptMap) {
    for (const i in scriptMap) {
        const scriptPath = scriptMap[i];
        const script = require(scriptPath);
        if (typeof script.getHelp == "function") {
            console.log(script.getHelp());
        }
    }
}

const args = new flappyArgs.FlappyArgs(process.argv.slice(2));

const workingDir = process.cwd();
const globalContext = utils.createGlobalContext(args);

if (args.isPresented("help", "h")) {
    printGeneralHelp();
    try {
        const projectRoot = utils.findProjectRoot(workingDir);
        const projectContext = utils.createProjectContext(globalContext, projectRoot, projectRoot, "project_conf")
        const scriptMap = findScripts(projectContext.searchDirs);
        printScriptsHelp(scriptMap);
    } catch (e) {
        printScriptsHelp(globalContext.scriptMap);
    }
} else if (args.args.length > 0) {
    const scriptName = args.args[0];

    // Global context
    if (globalContext.scriptMap.hasOwnProperty(scriptName)) {
        const script = require(globalContext.scriptMap[scriptName]);
        if (typeof script.runGlobal == "function") {
            return script.runGlobal(globalContext, args.args.slice(1)) || 0;
        }
    }

    // Project context
    const projectRoot = utils.findProjectRoot(workingDir);
    const projectContext = utils.createProjectContext(globalContext, projectRoot, projectRoot, "project_conf");

    if (projectContext.scriptMap.hasOwnProperty(scriptName)) {
        const script = require(projectContext.scriptMap[scriptName]);
        if (typeof script.run == "function") {
            return script.run(projectContext, args.args.slice(1)) || 0;
        }
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
    }
}
