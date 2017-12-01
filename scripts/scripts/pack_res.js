#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy pack_res <template>";
}

function packResources(context, templateName) {
    const utils = context.require("./utils.js");

    const generatorPath = utils.findTemplate(
        context.templateDirs,
        context.projectRoot,
        templateName);
    const buildContext = utils.createBuildContext(context, generatorPath, "project_conf");
    var projectGenerator = utils.requireGeneratorScript(generatorPath);
    projectGenerator.packResources(buildContext);
}

function run(context, args) {
    if (args < 1)
        throw new Error("At least template name expected");
    const templateName = args[0];
    packResources(context, templateName);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
