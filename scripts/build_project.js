"use strict"

function buildProject(params) {
    const utils = require("./utils.js");
    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
    utils.requireGeneratorScript(params.generatorPath).generate(context);
    utils.requireGeneratorScript(params.generatorPath).build(context);
}

module.exports.buildProject = buildProject;
