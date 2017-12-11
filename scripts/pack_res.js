#!/usr/bin/env node
"use strict"

module.exports.getHelp = function getHelp() {
    return "flappy pack_res <template> - Pack resources for target platform. (Should be generated first)";
}

function packResources(context, templateName) {
    const utils = context.requireFlappyScript("utils");
    const logger = context.requireFlappyScript("logger");

    const buildContext = utils.createBuildContext(context, generatorPath, "project_conf");
    var projectGenerator = utils.requireFlappyScript(path.join(templateName, "generator"));
    try {
        projectGenerator.packResources(buildContext);
    } catch (e) {
        logger.loge("Resouce packer filed: " + e.message);
    }
}

module.exports.run = function(context) {
    if (context.args.plainArgs.length < 1)
        throw new Error("At least template name expected");
    const templateName = context.args.plainArgs[0];

    const targetUtils = context.requireFlappyScript("target_utils");
    targetUtils.runGenerator(context, templateName, "packResources");
}
