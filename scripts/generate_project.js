#!/usr/bin/node
"use strict"

const path = require("path");

function mergeConfig(configOrder) {
    const merge_config = require("./merge_config.js")
    const config =  merge_config.parseJson(configOrder);
    console.log(config);
    return config;
}

function normalize(path, projectRoot) {
    const utils = require("./utils.js");
    if (path.indexOf("^/") != -1) {
        path = path.replace("^/","");
        return utils.absolutePath(projectRoot, path);
    } else {
        return utils.absolutePath(process.cwd, path);
    }
}

function run(templatePath, context) {
    const generator = require(path.join(templatePath, "generator.js"));
    generator.generate(context);
}

function generateProject(workingDir, templatePath, outDir, configOrder, projectRoot) {
    const compile_dir = require("./compile_dir.js");
    if (projectRoot == null)
        projectRoot = workingDir;
    const config = mergeConfig(configOrder);
    const context = {
        "projectRoot": projectRoot,
        "config": config,
        "compileDir": compile_dir.compileDir,
        "templatePath": templatePath,
        "mergeConfig": mergeConfig,
        "outDir": outDir,
        "normalize": path => normalize(path, projectRoot)
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
        ['p', 'project-root=ARG', 'Project root. If not set, root dir will be used as root.']
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const utils = require("./utils.js");

    const workingDir = process.cwd();
    const templatePath = utils.absolutePath(workingDir, opt.options["template-dir"]);
    const outDir = utils.absolutePath(workingDir, opt.options["output-dir"]);
    const configOrder = utils.absolutePath(workingDir, opt.options["config"]);
    const projectRoot = null;
    if (opt.options.hasOwnProperty("project-root"))
        projectRoot = utils.absolutePath(workingDir, opt.options["project-root"]);
    generateProject(workingDir, templatePath, outDir, configOrder, projectRoot);
}

