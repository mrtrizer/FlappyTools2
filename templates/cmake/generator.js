#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");
    const utils = require(context.findFlappyScript("utils.js"));
    const modules = require(context.findFlappyScript("modules.js"));

    // Get pathes of project and module template folders
    const moduleTemplatePath = path.join(context.generatorPath, "cmake_module");
    const projectTemplatePath = path.join(context.generatorPath, "cmake_project");

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];

        // Include nessesary parameters to module context and compile the template
        moduleContext.modules = modules.findModules(moduleContext);
        moduleContext.outDir = utils.absolutePath(context.targetOutDir, moduleContext.config.name);
        context.compileDir(moduleContext, moduleTemplatePath, moduleContext.outDir);
    }

    // Add nessary params to context and compile the template
    context.overallModules = allModulesContexts;
    context.modules = modules.findModules(context);
    context.compileDir(context, projectTemplatePath, context.targetOutDir);
}

module.exports.build = function(context) {
    const path = require("path");
    const efs = context.require("fs-extra")

    function call(command, cwd) {
        const childProcess = require("child_process");
        childProcess.execSync(command, {"cwd": cwd, stdio: "inherit"});
    }
    const buildDir = path.join(context.targetOutDir, "build");
    const logger = context.require("./logger.js");
    logger.logi("Build dir: " + buildDir);
    efs.mkdirsSync(buildDir);
    call("cmake -G \"Unix Makefiles\" ..", buildDir);
    call("make", buildDir);
}

function packRes (context, config, generator, resSrcDir, cacheDir) {
    const fse = context.require("fs-extra");
    const path = require("path");

    let resInfoList = [];
    const resList = generator.script.getResList(config, resSrcDir, cacheDir);
    for (const i in resList) {
        const res = resList[i];

        const outPath = path.join(context.targetOutDir, "resources", res.path);
        fse.copySync(res.fullPath, outPath);

        const resInfo = {
            "path" : res.path,
            "type" : res.type
        }
        resInfoList[res.path] = resInfo;
    }

    return resInfoList;
}

module.exports.packResources = function (context) {
    const fse = context.require("fs-extra");
    const path = context.require("path");
    const res_utils = context.require("./res_utils.js");
    const utils = context.require("./utils.js");

    var fileInfoMap = [];

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        const projectGenerator = utils.requireGeneratorScript(context.generatorPath);
        const fileInfoSubList = packRes(context, config, generator, resSrcDir, cacheDir);
        fileInfoMap = Object.assign({}, fileInfoMap, fileInfoSubList);
    });

    const outDir = path.join(context.targetOutDir, "resources");
    fse.mkdirsSync(outDir)

    const fileListPath = path.join(outDir, "file_list.json");

    fse.writeJsonSync(fileListPath, fileInfoMap, { spaces: "    " });

    const cacheDir = res_utils.getCacheDir(context);
    const cacheMetaSourcePath = path.join(cacheDir, "cache_meta.json");
    const cacheMetaOurPath = path.join(outDir, "cache_meta.json");
    fse.copySync(cacheMetaSourcePath, cacheMetaOurPath);
}
