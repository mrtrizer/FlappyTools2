"use strict"

module.exports.getHelp = function() {
    return "flappy gen <template> - Build resources and generate project for target platform.";
}

module.exports.run = function(context) {
    context.requireFlappyScript("gen_target").run(context);
}

module.exports.after = ["pack_res"];
