"use strict"

function packResources(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
}

function generateProject(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
    utils.requireGeneratorScript(params.generatorPath).generate(context);
}

module.exports.generateProject = generateProject;
