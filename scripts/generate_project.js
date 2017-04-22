#!/usr/bin/node
"use strict"

const path = require("path");

function mergeConfig(projectDir, configOrder) {
    const merge_config = require("./merge_config.js")
    const config =  merge_config.parseJson(configOrder);
    console.log(config);
    return config;
}

function findProjectRoot(workingDir) {
    return workingDir;
}

function run(templatePath, context) {
    const generator = require(path.join(templatePath, "generator.js"));
    generator.generate(context);
}

function generateProject(workingDir, templatePath, outDir, configOrder) {
    const compile_dir = require("./compile_dir.js");

    const projectDir = findProjectRoot(workingDir);
    const config = mergeConfig(projectDir, configOrder);
    const context = {
        "projectDir": projectDir,
        "config": config,
        "compileDir": compile_dir.compileDir,
        "templatePath": templatePath,
        "mergeConfig": mergeConfig,
        "outDir": outDir
    }
    run(templatePath, context)
}

module.exports.generateProject = generateProject;

// If run as script
if (require.main == module) {
    const workingDir = process.cwd();
    const templatePath = process.argv[2];
    const outDir = process.argv[3];
    const configOrder = [process.argv[4]];
    generateProject(workingDir, templatePath, outDir, configOrder);
}

