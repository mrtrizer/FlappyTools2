#!/usr/bin/nodejs
"use strict"

function cmakeNormalize(context, path) {
    var normalizedPath = context.normalize(path);
    return process.platform == "win32" ?  normalizedPath.replace(/\\/g, "/") : normalizedPath;
}

module.exports.generate = function(context) {
    const path = require("path");
    const utils = context.requireFlappyScript("utils");
    const modules = context.requireFlappyScript("modules");
    const compileDir = context.requireFlappyScript("compile_dir");

    // Get pathes of project and module template folders
    const moduleTemplatePath = path.join(__dirname, "cmake");
    const projectTemplatePath = path.join(__dirname, "cmake");

    const projectBuildContext = utils.createBuildContext(context, __dirname, "project_conf");

    // Iterate all modules in a project
    const allModulesContexts = modules.findAllModules(context);
    let allModulesBuildContexts = [];
    for (let i in allModulesContexts) {
        const moduleContext = allModulesContexts[i];
        const moduleBuildContext = utils.createBuildContext(moduleContext, __dirname, "module_conf");
        // Include nessesary parameters to module context and compile the template
        moduleBuildContext.modules = modules.findModules(moduleContext);
        moduleBuildContext.outDir = utils.absolutePath(projectBuildContext.targetOutDir, moduleContext.config.name);
        moduleBuildContext.cmakeNormalize = cmakeNormalize;
        allModulesBuildContexts.push(moduleBuildContext);
        compileDir.compileDir(moduleBuildContext, moduleTemplatePath, moduleBuildContext.outDir);
    }

    // Add nessary params to context and compile the template
    projectBuildContext.overallModules = allModulesBuildContexts;
    projectBuildContext.cmakeNormalize = cmakeNormalize;
    projectBuildContext.modules = modules.findModules(context);

    compileDir.compileDir(projectBuildContext, projectTemplatePath, projectBuildContext.targetOutDir);
}

module.exports.build = function(context) {
    const path = require("path");
    const efs = context.require("fs-extra");
    const utils = context.requireFlappyScript("utils");

    const projectBuildContext = utils.createBuildContext(context, __dirname, "project_conf");

    function call(command, cwd) {
        const childProcess = require("child_process");
        childProcess.execSync(command, {"cwd": cwd, stdio: "inherit"});
    }
    const buildDir = path.join(projectBuildContext.targetOutDir, "build");
    const logger = projectBuildContext.requireFlappyScript("logger");
    logger.logi("Build dir: " + buildDir);
    efs.mkdirsSync(buildDir);
    call("cmake -G \"Unix Makefiles\" ..", buildDir);
    call("make", buildDir);
}

function packRes (context, res) {
    const fse = context.require("fs-extra");
    const path = require("path");

    const outPath = path.join(context.targetOutDir, "resources", res.path);
    fse.copySync(res.fullPath, outPath);

    return {
        "path" : res.path,
        "type" : res.type
    }
}

module.exports.packResources = function (context) {
    const fse = context.require("fs-extra");
    const path = context.require("path");
    const utils = context.requireFlappyScript("utils");
    const logger = context.requireFlappyScript("logger");

    const projectBuildContext = utils.createBuildContext(context, __dirname, "project_conf");

    var fileInfoMap = {};

    const cacheMetaSourcePath = path.join(projectBuildContext.projectRoot, "flappy_cache/cache_meta.json");
    if (!fse.existsSync(cacheMetaSourcePath)) {
        logger.logi("Project has no resources to pack. Skipping.");
        return;
    }

    const metaDataMap = fse.readJsonSync(cacheMetaSourcePath);
    for (const resName in metaDataMap) {
        const metaData = metaDataMap[resName];
        if (metaData.type == "file") {
            fileInfoMap[metaData.path] = (packRes(projectBuildContext, metaData));
        }
    }

    const outDir = path.join(projectBuildContext.targetOutDir, "resources");
    fse.mkdirsSync(outDir)

    const fileListPath = path.join(outDir, "file_list.json");

    fse.writeJsonSync(fileListPath, fileInfoMap, { spaces: "    " });

    const cacheMetaOurPath = path.join(outDir, "cache_meta.json");
    fse.copySync(cacheMetaSourcePath, cacheMetaOurPath);
}

module.exports.generatorName = "cmake"
