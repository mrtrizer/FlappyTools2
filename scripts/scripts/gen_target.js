#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy gen_target <template>";
}

function run(context, args) {
    if (args < 1)
        throw new Error("At least template name expected");
    const utils = context.require("./utils.js");
    const templateName = args[0];

    const generatorPath = utils.findTemplate(
        context.templateDirs,
        context.projectRoot,
        templateName);

    utils.requireGeneratorScript(generatorPath).generate(context);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
