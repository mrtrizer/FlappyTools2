#!/usr/bin/node
"use strict"

const path = require("path");

function findProjectRoot(workingDir) {
    const fs = require("fs");

    let currentDir = workingDir;
    let nextDir = workingDir;
    do {
        currentDir = nextDir;
        if (fs.existsSync(path.join(currentDir, "flappy_conf")))
            return currentDir;
        nextDir = path.normalize(path.join(currentDir, ".."));
    } while (currentDir != nextDir);

    throw new Error("Can't find project root");
}

function flappyGenerate(workingDir, projectRoot, templateName, forceOutDir, configOrder, extraParams) {
    const utils = require("./utils.js");

    const generate_project = require("./generate_project.js");

    const flappyConfig = getFlappyConfig();

    const templatePath = findTemplate(flappyConfig, projectRoot, templateName)

    const outDir = forceOutDir || utils.absolutePath(projectRoot, "generated/" + templateName);


    generate_project.generateProject(workingDir, templatePath, outDir, configOrder, projectRoot, extraParams);
}

function findTemplate(flappyConfig, projectRoot, name) {
    const fs = require("fs");
    const path = require('path');
    const utils = require("./utils.js");

    let templateDirs = flappyConfig["template_dirs"];
    const scriptPath = path.dirname(require.main.filename);
    templateDirs.push(path.join(scriptPath, "../templates"));
    templateDirs.push(utils.absolutePath(projectRoot, "templates"));

    for (let i in templateDirs) {
        const templateDir = templateDirs[i];
        const templatePath = utils.absolutePath(templateDir, name);
        if (fs.existsSync(templatePath))
            return templatePath;
    }
    throw new Error("Can't find template.");
}

function getFlappyConfig() {
    const os = require("os");
    const fs = require("fs");

    const configFilePath = path.join(os.homedir(), ".config/flappy/config.json");
    const configData = fs.readFileSync(configFilePath, "utf8");
    const flappyConfig = JSON.parse(configData);
    return flappyConfig;
}

module.exports.flappyGenerate = flappyGenerate;

// If run as script
if (require.main == module) {
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
    const projectRoot = findProjectRoot(workingDir);

    const forceOutDir = opt.options["output-dir"];
    const templateName = opt.argv[0];

    const configOrder = opt.argv.slice(1);

    flappyGenerate(workingDir, projectRoot, templateName, forceOutDir, configOrder);
}

