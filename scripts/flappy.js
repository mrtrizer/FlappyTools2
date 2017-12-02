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

const args = new flappyArgs.FlappyArgs(process.argv.slice(2));

const flappyHomeDir = path.join(homedir(), ".flappy");
const workingDir = process.cwd();

if (args.isPresented("help", "h")) {
    printGeneralHelp();
    try {
        const projectRoot = utils.findProjectRoot(workingDir);
        const scriptDirs = [__dirname, flappyHomeDir, projectRoot];
        const scriptMap = findScripts(scriptDirs);
        printScriptsHelp(scriptMap);
    } catch (e) {
        const scriptDirs = [__dirname, flappyHomeDir]
        const scriptMap = findScripts(scriptDirs);
        printScriptsHelp(scriptMap);
    }
} else if (args.args.length > 0) {
    const scriptName = args.args[0];

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
                return script.runGlobal(globalContext, args.args.slice(1)) || 0;
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
                return script.run(context, args.args.slice(1)) || 0;
            }
        } else {
            logger.loge(`Can't find script with name "${scriptName}"`);
        }
    }
}
