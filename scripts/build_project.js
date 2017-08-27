"use strict"

function buildProject(params) {
    const utils = require("./utils.js");
    const generateProject = require("./generate_project.js");
    generateProject.generateProject(params);
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
    utils.requireGeneratorScript(params.generatorPath).build(context);
}

module.exports.buildProject = buildProject;
