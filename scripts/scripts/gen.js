#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy gen <template>";
}

function run(context, args) {
    if (args < 1)
        throw new Error("At least template name expected");
    const genResourcesScript = context.requireFlappyScript("gen_res");
    genResourcesScript.run(context, []);
    const packResourcesScript = context.requireFlappyScript("pack_res");
    packResourcesScript.run(context, args);
    const genTargetScript = context.requireFlappyScript("gen_target");
    genTargetScript.run(context, args);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
