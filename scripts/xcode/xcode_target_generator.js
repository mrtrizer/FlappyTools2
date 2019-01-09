#!/usr/bin/nodejs
"use strict"

function getCMakeGenerator(context) {
    const targetUtils = context.requireFlappyScript("target_utils");
    return targetUtils.findGenerator(context, "cmake");
}

function call(command, cwd) {
    const childProcess = require("child_process");
    childProcess.execSync(command, {"cwd": cwd, stdio: "inherit"});
}

function getBuildDir(context) {
    const path = require("path");
    const utils = context.requireFlappyScript("utils");
    const projectBuildContext = utils.createBuildContext(context, __dirname, "project_conf");
    const buildDir = path.join(projectBuildContext.targetOutDir, "xcode_build");
    const logger = projectBuildContext.requireFlappyScript("logger");
    logger.logi("Build dir: " + buildDir);
    return buildDir;
}

module.exports.generate = function(context) {
    getCMakeGenerator(context).generate(context);
    const path = require("path");
    const efs = context.require("fs-extra");
    const utils = context.requireFlappyScript("utils");

    const projectBuildContext = utils.createBuildContext(context, __dirname, "project_conf");

    const buildDir = getBuildDir(context);
    efs.mkdirsSync(buildDir);

    call("cmake -G \"Xcode\" ..", buildDir);
}

module.exports.build = function(context) {
    if (process.platform != "darwin")
        throw new Error("Can build only for MacOS");
    const path = require("path");
    const efs = context.require("fs-extra");
    const utils = context.requireFlappyScript("utils");

    const buildDir = getBuildDir(context);

    call(`xcodebuild -scheme ALL_BUILD build -project ${context.config.name}.xcodeproj`, buildDir);
}

module.exports.packResources = function (context) {
    getCMakeGenerator(context).packResources(context);
}

module.exports.generatorName = "xcode"
