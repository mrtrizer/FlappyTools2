#!/usr/bin/nodejs
"use strict"

function readDirs(root) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    const fileList = fs.readdirSync(root);
    for (let filePathN in fileList) {
        const filePath = fileList[filePathN];
        const absoluteFilePath = path.join(root, filePath);
        const stat = fs.lstatSync(absoluteFilePath);
        if (stat.isDirectory())
            outList = outList.concat(readDirs(absoluteFilePath));
        else
            outList.push(absoluteFilePath);
    }
    return outList;
}

function isExcluded(projectRoot, absolutePath, excludes) {
    const path = require("path");

    const normalizedPath = path.normalize(absolutePath); 
    for (let excludedN in excludes) {
        const excluded = excludes[excludedN];
        const excludeAbsolute = path.join(projectRoot, excluded);
        const excludeNormalized = path.normalize(excludeAbsolute);
        if (normalizedPath.indexOf(excludeAbsolute) != -1)
            return true;
    }
    return false;
}

function sourceList(projectRoot, sourceDirs, excludes) {
    const fs = require("fs");
    const path = require("path");

    let outList = [];
    for (let sourceDirN in sourceDirs) {
        const sourceDir = sourceDirs[sourceDirN];
        const absoluteSourceDir = path.join(projectRoot, sourceDir)
        const fileList = readDirs(absoluteSourceDir);
        for (let filePathN in fileList) {
            const filePath = fileList[filePathN];
            if (!isExcluded(projectRoot, filePath, excludes))
                outList.push(filePath);
        }
    }
    return outList;
}

module.exports.generate = function(context) {
    const path = require("path");

    context.sourceList = sourceList;

    const templateDir = path.join(context.templatePath, "cmake_project");
    console.log(templateDir);
    context.compileDir(context, templateDir, context.outDir);

    // Generate subprojects
    for (let i in context.modules) {
        const module = context.modules[i];

        const moduleOutDir = path.join(context.outDir, "/modules/", module.name);
        const moduleContext = context.createSubContext(module.path, "default_submodule.json", moduleOutDir);
        const moduleTemplateDir = path.join(context.templatePath, "cmake_module");
        context.compileDir(moduleContext, moduleTemplateDir, moduleOutDir);
    }
}

