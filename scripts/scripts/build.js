#!/usr/bin/env node
"use strict"

function getHelp() {
    return "flappy build <template>";
}

function run(context, args) {
    if (args.length < 1)
        throw new Error("At least template name expected");
    const genScript = context.requireFlappyScript("gen");
    genScript.run(context, args);
}

module.exports.run = run;
module.exports.getHelp = getHelp;
