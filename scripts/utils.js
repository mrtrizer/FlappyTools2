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

function requireGeneratorScript(generatorPath) {
    return require(path.join(generatorPath, "generator.js"));
}

function copyFile(source, target, cb) {
    const fs = require("fs")
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (cb && !cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

// Read file lists in directories recursively. Returns list of pathes.
function readDirs(root) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    const fileList = fs.readdirSync(root);
    for (let filePathN in fileList) {
        const filePath = fileList[filePathN];
        const absoluteFilePath = path.join(root, filePath);
        const stat = fs.lstatSync(absoluteFilePath);
        if (stat.isDirectory())
            outList = outList.concat(readDirs(absoluteFilePath));
        else
            outList.push(absoluteFilePath);
    }
    return outList;
}

function mergeConfigs(projectRoot, generatorPath, defaultConfigFileName, configOrder) {
    const utils = require("./utils.js");
    const path = require("path");

    const defaultConfig = utils.absolutePath(generatorPath, defaultConfigFileName); // template default config
    const generalConfig = utils.absolutePath(projectRoot, "flappy_conf/general.json"); // project default config

    let fullConfigOrder = [defaultConfig, generalConfig];

    for (let i in configOrder) {
        const config = configOrder[i];

        fullConfigOrder.push(path.join(projectRoot, "flappy_conf", config + ".json"));
    }

    return fullConfigOrder;
}

function normalize(path, projectRoot) {
    const utils = require("./utils.js");
    return utils.absolutePath(projectRoot, path);
}

// Check if file excluded
function isExcluded(projectRoot, absolutePath, excludes) {
    const path = require("path");

    const normalizedPath = path.normalize(absolutePath);
    for (let excludedN in excludes) {
        const excluded = excludes[excludedN];
        const excludeAbsolute = path.join(projectRoot, excluded);
        const excludeNormalized = path.normalize(excludeAbsolute);
        if (normalizedPath.indexOf(excludeAbsolute) != -1)
            return true;
    }
    return false;
}

// Returns source file list considering excludes
function sourceList(projectRoot, sourceDirs, excludes) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    for (let sourceDirN in sourceDirs) {
        const sourceDir = sourceDirs[sourceDirN];
        const absoluteSourceDir = path.join(projectRoot, sourceDir)
        const fileList = readDirs(absoluteSourceDir);
        for (let filePathN in fileList) {
            const filePath = fileList[filePathN];
            if (!isExcluded(projectRoot, filePath, excludes))
                outList.push(filePath);
        }
    }
    return outList;
}

function findFlappyScript(name) {
    const path = require('path');
    const scriptPath = path.dirname(require.main.filename);
    return path.join(scriptPath, name);
}

function createContext(context, projectRoot, defaultConfigFileName) {
    const compile_dir = require("./compile_dir.js");
    const merge_config = require("./merge_config.js");

    const configOrder = mergeConfigs(
        projectRoot,
        context.generatorPath,
        defaultConfigFileName,
        context.configOrder
    );

    const config = merge_config.parseJson(configOrder, context.extraParams);

    const newContext = {
        "projectRoot": projectRoot,
        "config": config,
        "compileDir": compile_dir.compileDir,
        "generatorPath": context.generatorPath,
        "targetOutDir": context.targetOutDir,
        "normalize": path => normalize(path, projectRoot),
        "sourceList": sourceList,
        "configOrder": context.configOrder,
        "extraParams": context.extraParams,
        "findFlappyScript": findFlappyScript,
        "createContext": createContext
    };
    return newContext;
}

module.exports.defaultConfigFileName = "default.json";
module.exports.absolutePath = absolutePath;
module.exports.findParams = findParams;
module.exports.findProjectRoot = findProjectRoot;
module.exports.findTemplate = findTemplate;
module.exports.getFlappyConfig = getFlappyConfig;
module.exports.requireGeneratorScript = requireGeneratorScript;
module.exports.copyFile = copyFile;
module.exports.readDirs = readDirs;
module.exports.sourceList = sourceList;
module.exports.createContext = createContext;
module.exports.findFlappyScript = findFlappyScript;
