#!/usr/bin/env node
"use strict"

const childProcess = require("child_process");
const path = require("path");
const utils = require("./utils.js");
const logger = require("./logger.js");
const homedir = require("homedir");

function printHelp() {
    console.log("Options:");
    console.log("\tflappy --help - Print help message");
}

const argv = process.argv.slice(2);

const configOrder = [];
const args = [];
const extraFields = {};

// Parse arguments
for (const i in argv) {
    const arg = argv[i];
    if (arg.trim()[0] == "+") {
        configOrder.push(arg.substr(1));
    } else if (arg.trim()[0] == ".") {
        const fieldPairSplit = arg.substr(1).split("=");
        extraFields[fieldPairSplit[0]] = fieldPairSplit[1];
    } else {
        args.push(arg);
    }
}

const workingDir = process.cwd();
const projectRoot = utils.findProjectRoot(workingDir);

const flappyHomeDir = path.join(homedir(), ".flappy");

const context = utils.createContext(
                                projectRoot,
                                projectRoot,
                                configOrder,
                                "project_conf",
                                extraFields);

const scriptDirs = [__dirname, flappyHomeDir, projectRoot];
let scriptMap = {};
for (const i in scriptDirs) {
    const scriptDir = path.join(scriptDirs[i], "scripts");
    const scriptList = utils.readDirs(scriptDir);
    for (const j in scriptList) {
        const scriptPath = scriptList[j];
        const scriptName = path.parse(scriptPath).name;
        scriptMap[scriptName] = scriptPath;
    }
}

context["requireFlappyScript"] = function(scriptName) {
    if (scriptMap.hasOwnProperty(scriptName)) {
        return require(scriptMap[scriptName]);
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
        return {}
    }
}

if (args.length > 0) {
    const scriptName = args[0];
    if (scriptMap.hasOwnProperty(scriptName)) {
        const script = require(scriptMap[scriptName]);
        script.run(context, args.slice(1));
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
    }
} else {
    console.log(JSON.stringify(configOrder, null, "  "));
    console.log(JSON.stringify(context, null, "  "));
    console.log(JSON.stringify(args, null, "  "));
    console.log(JSON.stringify(extraFields, null, "  "));
}
