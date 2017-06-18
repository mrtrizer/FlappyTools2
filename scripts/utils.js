"use strict"

// Converts relative pathes to absolute normalized pathes
function absolutePath () {
        const path = require("path");
        return path.normalize(path.join.apply(path, arguments));
}

function findProjectRoot(workingDir) {
    const fs = require("fs");
    const path = require("path");

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

function findParams(projectRoot, templateName, projectOutDir, configOrder, extraParams) {
    const generate_project = require("./generate_project.js");

    const flappyConfig = getFlappyConfig();

    const generatorPath = findTemplate(flappyConfig, projectRoot, templateName)

    const targetOutDir = projectOutDir || absolutePath(projectRoot, "generated/" + templateName);

    const params = {
        "projectRoot": projectRoot,
        "generatorPath": generatorPath,
        "targetOutDir": targetOutDir,
        "configOrder": configOrder,
        "extraParams": extraParams
    };

    return params;
}

function findTemplate(flappyConfig, projectRoot, name) {
    const fs = require("fs");
    const path = require('path');

    let templateDirs = flappyConfig["template_dirs"];
    const scriptPath = path.dirname(require.main.filename);
    templateDirs.push(path.join(scriptPath, "../templates"));
    templateDirs.push(absolutePath(projectRoot, "templates"));

    for (let i in templateDirs) {
        const templateDir = templateDirs[i];
        const generatorPath = absolutePath(templateDir, name);
        if (fs.existsSync(generatorPath))
            return generatorPath;
    }
    throw new Error("Can't find template.");
}

function getFlappyConfig() {
    const os = require("os");
    const fs = require("fs");
    const path = require("path");

    if (typeof os.homedir === "undefined") {
        throw new Error("Update nodejs. For proper work nodejs >= 4.0 required.");
    }

    const configFilePath = path.join(os.homedir(), ".config/flappy/config.json");
    if (!fs.existsSync(configFilePath)) {
        return {"template_dirs":[]};
    }
    const configData = fs.readFileSync(configFilePath, "utf8");
    const flappyConfig = JSON.parse(configData);
    return flappyConfig;
}

module.exports.absolutePath = absolutePath;
module.exports.findParams = findParams;
module.exports.findProjectRoot = findProjectRoot;
module.exports.findTemplate = findTemplate;
module.exports.getFlappyConfig = getFlappyConfig;
