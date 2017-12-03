#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy build <template> - Build all resources and project.";
}

function run(context, args) {
    const utils = context.require("./utils.js");
    if (args.length < 1)
        throw new Error("At least template name expected");
    const templateName = args[0];
    const genScript = context.requireFlappyScript("gen");
    genScript.run(context, args);
    const generatorPath = utils.findTemplate(context.searchDirs, templateName);
    const buildContext = utils.createBuildContext(context, generatorPath, "project_conf");
    var projectGenerator = utils.requireGeneratorScript(generatorPath);
    projectGenerator.build(buildContext);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
