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
    for (const key in scriptMap) {
        const script = scriptMap[key];
        if (typeof script.getHelp === "function") {
            console.log(script.getHelp());
        }
    }
}

const args = new flappyArgs.FlappyArgs(process.argv.slice(2));

const workingDir = process.cwd();
const globalContext = utils.createGlobalContext(args, args.plainArgs.slice(1));

if (args.isPresented("help", "h")) {
    printGeneralHelp();
    try {
        const projectRoot = utils.findProjectRoot(workingDir);
        const moduleContext = utils.createModuleContext(globalContext, projectRoot, projectRoot, "project_conf")
        const projectContext = utils.createProjectContext(moduleContext);
        printScriptsHelp(projectContext.scriptMap);
    } catch (e) {
        printScriptsHelp(globalContext.scriptMap);
    }
} else if (args.plainArgs.length > 0) {
    const scriptName = args.plainArgs[0];

    try {
        // Global context
        if (globalContext.scriptMap.hasOwnProperty(scriptName)) {
            const script = globalContext.scriptMap[scriptName];
            if (typeof script.runGlobal === "function")
                return globalContext.runFlappyScript(scriptName, "runGlobal") || 0;
        }

        // Project context
        const projectRoot = utils.findProjectRoot(workingDir);
        const moduleContext = utils.createModuleContext(globalContext, projectRoot, projectRoot, "project_conf");
        const projectContext = utils.createProjectContext(moduleContext);

        if (projectContext.scriptMap.hasOwnProperty(scriptName)) {
            return projectContext.runFlappyScript(scriptName, "run") || 0;
        } else {
            logger.loge(`Can't find script with name "${scriptName}"`);
        }
    } catch (e) {
        logger.loge(`${e.message}`);
    }
}
