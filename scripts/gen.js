#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy gen <template> - Build resources and generate project for target platform.";
}

function run(context, args) {
    if (args.length < 1)
        throw new Error("At least template name expected");
    context.runFlappyScript("gen_res", "run");
    context.runFlappyScript("pack_res", "run");
    context.runFlappyScript("gen_target", "run");
}

module.exports.run = run;
module.exports.getHelp = getHelp;
