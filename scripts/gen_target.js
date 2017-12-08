"use strict"

module.exports.getHelp = function() {
    return "flappy gen_target <template> - Generate project for target platform.";
}

module.exports.run = function(context, args) {
    if (args.length < 1)
        throw new Error("At least template name expected");
    const utils = context.requireFlappyScript("utils");
    const templateName = args[0];

    const generatorPath = utils.findTemplate(
        context.searchDirs,
        templateName);

    utils.requireGeneratorScript(generatorPath).generate(context);
}

module.exports.after = ["pack_res"];
