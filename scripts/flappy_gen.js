#!/usr/bin/node
"use strict"

const path = require("path");

function findProjectRoot(workingDir) {
    const fs = require("fs");

    let nextDir = workingDir;
    do {
        let currentDir = nextDir;
        if (fs.existsSync(path.join(currentDir, "flappy_conf")))
            return currentDir;
        nextDir = path.normalize(path.join(currentDir, ".."));
    } while (currentDir != nextDir);

    throw new Error("Can't find project root");
}

function flappyGenerate(workingDir, templatePath, outDir, configOrder, projectRoot) {
    const generate_project = require("./generate_project.js");

    generate_project.generate_project(workingDir, templatePath, outDir, configOrder, projectRoot);
}

function findTemplate(flappyConfig, name) {
    const fs = require("fs");

    let templateDirs = flappyConfig["template_dirs"];
    templateDirs.push[flappyPath]

    for (let i in templateDirs) {
        const templateDir = flappyConfig["template_dirs"][0];
        const templatePath = utils.absolutePath(templateDir, name);
        if (fs.exists(templatePath))
            return templatePath;
    }
    throw new Error("Can't find template.");
}

function getFlappyConfig() {
    const configFilePath = path.join(os.homedir(), ".config/flappy/config.json");
    const configData = fs.readFileSync(configFilePath, "utf8");
    const flappyConfig = JSON.parse(configData);
    return flappyConfig;
}

module.exports.flappy = flappy;

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const utils = require("./utils.js");
    const os = require("os");
    const fs = require("fs");

    const flappyConfig = getFlappyConfig();

    const workingDir = process.cwd();
    const projectRoot = findProjectRoot(workingDir);

    const templateName = opt.arguments[1];
    const templatePath = findTemplate(flappyConfig, templateName)

    const outDir = utils.absolutePath(projectDir, "generated/" + templateName);

    const defaultConfig = utils.absolutePath(templatePath, "default.json"); // template default config
    const generalConfig = utils.absolutePath(projectDir, "flappy_conf/general.json"); // project default config
    const configOrder = [defaultConfig, generalConfig];

    flappyGenerate(workingDir, templatePath, outDir, configOrder, projectRoot);
}

