#!/usr/bin/env node
"use strict"

const childProcess = require("child_process");
const path = require("path");
const utils = require("./utils.js");
const mergeConfig = require("./merge_config.js");
const logger = require("./logger.js");
const homedir = require("homedir");

function printGeneralHelp() {
    console.log("Options:");
    console.log("\tflappy --help - Print help message");
}

function printHelp(scriptMap) {
    for (const i in scriptMap) {
        const scriptPath = scriptMap[i];
        const script = require(scriptPath);
        if (typeof script.getHelp == "function") {
            console.log(script.getHelp());
        }
    }
}

function findScripts(scriptDirs) {
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
    return scriptMap;
}

function requireFlappyScript(scriptMap, scriptName) {
    if (scriptMap.hasOwnProperty(scriptName)) {
        return require(scriptMap[scriptName]);
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
        return {}
    }
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

const scriptName = args[0];
const workingDir = process.cwd();
const flappyHomeDir = path.join(homedir(), ".flappy");

// Context-agnostic
{
    const scriptDirs = [__dirname, flappyHomeDir]
    const scriptMap = findScripts(scriptDirs);

    if (scriptMap.hasOwnProperty(scriptName)) {
        const script = require(scriptMap[scriptName]);
        if (typeof script.runGlobal == "function") {
            // TODO: Move code of context and config compilation to function
            const globalContext = {};
            globalContext["require"] = require;
            globalContext["workingDir"] = workingDir;
            globalContext["flappyHomeDir"] = flappyHomeDir;
            globalContext["flappyToolsRoot"] = path.join(__dirname, "..");
            globalContext["requireFlappyScript"] = scriptName => requireFlappyScript(scriptMap, scriptName)
            const configDirs = [__dirname, flappyHomeDir];
            const configPathOrder = utils.findConfigs(configDirs, configOrder);
            const config = mergeConfig.parseJson(configPathOrder, extraFields);
            globalContext["config"] = config;
            return script.runGlobal(globalContext, args.slice(1)) || 0;
        }
    }
}

// Context-specific
{
    const projectRoot = utils.findProjectRoot(workingDir);
    const context = utils.createContext(projectRoot, projectRoot, configOrder, "project_conf", extraFields);

    const scriptDirs = [__dirname, flappyHomeDir, projectRoot];
    const scriptMap = findScripts(scriptDirs);

    if (scriptMap.hasOwnProperty(scriptName)) {
        const script = require(scriptMap[scriptName]);
        if (typeof script.run == "function") {
            context["requireFlappyScript"] = scriptName => requireFlappyScript(scriptMap, scriptName)
            return script.run(context, args.slice(1)) || 0;
        }
    } else {
        logger.loge(`Can't find script with name "${scriptName}"`);
    }
}
