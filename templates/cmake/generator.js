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
    function call(command, cwd) {
        const childProcess = require("child_process");
        console.log(childProcess.execSync(command, {"cwd": cwd}));
    }
    console.log("Project out dir: " + context.targetOutDir);
    call("cmake -G \"Unix Makefiles\"", context.targetOutDir);
    call("make", context.targetOutDir);
}

function packRes (context, config, generator, resSrcDir, cacheDir) {
    const fse = context.require("fs-extra");
    const path = require("path");

    let resInfoList = [];
    const resList = generator.getResList(config, resSrcDir, cacheDir);
    for (const i in resList) {
        const res = resList[i];

        const outPath = path.join(context.targetOutDir, "resources", res.path);
        fse.copySync(res.fullPath, outPath);

        const resInfo = {
            "name" : path.parse(res.path).name,
            "path" : res.path,
            "type" : res.type
        }
        resInfoList.push(resInfo);
    }

    return resInfoList;
}

module.exports.packResources = function (context) {
    const fse = context.require("fs-extra");
    const path = context.require("path");
    const res_utils = context.require("./res_utils.js");
    const utils = context.require("./utils.js");

    var resInfoList = [];

    res_utils.iterateResourcesRecursive(context, (config, generator, resSrcDir, cacheDir) => {
        const projectGenerator = utils.requireGeneratorScript(context.generatorPath);
        const resInfoSubList = packRes(context, config, generator, resSrcDir, cacheDir);
        console.log("resInfoSubList" + JSON.stringify(resInfoSubList));
        resInfoList = resInfoList.concat(resInfoSubList);
    });

    var resBaseData = {
        "list" : resInfoList
    }

    const outDir = path.join(context.targetOutDir, "resources");

    fse.mkdirsSync(outDir)

    const outPath = path.join(context.targetOutDir, "resources", "res_list.json");

    console.log("Saving resource list to " + outPath);

    fse.writeJsonSync(outPath, resBaseData, {
        spaces: "    "
    });
}
