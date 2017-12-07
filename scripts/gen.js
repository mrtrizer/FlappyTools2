#!/usr/bin/env node
"use strict"

module.exports.getHelp = function() {
    return "flappy gen <template> - Build resources and generate project for target platform.";
}

module.exports.run = function(context, args) {
    if (args.length < 1)
        throw new Error("At least template name expected");
    context.requireFlappyScript("gen_target").run(context, args);
}

module.exports.after = ["pack_res"];
