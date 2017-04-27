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
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['t', 'template-dir=ARG', 'Template dir. Should contain generator.js.'],
        ['c', 'config=ARG+', 'Configuration.'],
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const workingDir = process.cwd();
    const templatePath = opt.options["template-dir"];
    const outDir = opt.options["output-dir"];
    const configOrder = opt.options["config"];
    generateProject(workingDir, templatePath, outDir, configOrder);
}

