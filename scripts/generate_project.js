"use strict"

function generateProject(params) {
    const utils = require("./utils.js");
    const pack_resources = require("./pack_resources.js");
    const generate_resources = require("./generate_resources.js");

    generate_resources.generateResources(params);
    pack_resources.packResources(params);

    const context = utils.createContext(params, params.projectRoot, utils.defaultConfigFileName);
    utils.requireGeneratorScript(params.generatorPath).generate(context);
}

module.exports.generateProject = generateProject;
