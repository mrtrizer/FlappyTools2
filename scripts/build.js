"use strict"

module.exports.getHelp = function() {
    return "flappy build <template> - Build all resources and project.";
}

module.exports.run = function(context) {
    const utils = context.requireFlappyScript("utils");
    if (context.args.plainArgs.length < 1)
        throw new Error("At least template name expected");
    const templateName = context.args.plainArgs[0];
    const generatorPath = utils.findTemplate(context.searchDirs, templateName);
    const buildContext = utils.createBuildContext(context, generatorPath, "project_conf");
    var projectGenerator = utils.requireGeneratorScript(generatorPath);
    projectGenerator.build(buildContext);
}

module.exports.after = ["gen"];
