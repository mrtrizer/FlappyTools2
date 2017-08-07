"use strict"

const path = require("path");

const defaultConfigFileName = "default.json"

function requireGeneratorScript(generatorPath) {
    return require(path.join(generatorPath, "generator.js"));
}

function generateProject(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, defaultConfigFileName);
    requireGeneratorScript(params.generatorPath).generate(context);
}

function buildProject(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, defaultConfigFileName);
    requireGeneratorScript(params.generatorPath).generate(context);
    requireGeneratorScript(params.generatorPath).build(context);
}

function packResources(params) {
    const utils = require("./utils");
    const context = utils.createContext(params, params.projectRoot, defaultConfigFileName);
}

module.exports.generateProject = generateProject;
module.exports.buildProject = buildProject;
