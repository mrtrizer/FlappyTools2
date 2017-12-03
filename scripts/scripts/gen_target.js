#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy gen_target <template> - Generate project for target platform.";
}

function run(context, args) {
    if (args.length < 1)
        throw new Error("At least template name expected");
    const utils = context.require("./utils.js");
    const templateName = args[0];

    const generatorPath = utils.findTemplate(
        context.searchDirs,
        templateName);

    utils.requireGeneratorScript(generatorPath).generate(context);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
