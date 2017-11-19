#!/usr/bin/env node
"use strict"

const utils = require("./utils.js");
const generateProject = require("./generate_project.js");
const generateResources = require("./generate_resources.js");
const packResources = require("./pack_resources.js");

const opt = require('node-getopt').create([
    ['o', 'output-dir=ARG', 'Output dir.'],
    ['h', 'help', 'Display this help.'],
])
.bindHelp()
.parseSystem();

if (opt.argv.length < 1) {
    console.log("flappy gen <template>");
    return;
}

const workingDir = process.cwd();
const projectRoot = utils.findProjectRoot(workingDir);

const projectOutDir = opt.options["output-dir"];
const templateName = opt.argv[0];

const configOrder = opt.argv.slice(1);

var params = utils.findParams(projectRoot, templateName, projectOutDir, configOrder, []);

generateResources.generateResources(params);
packResources.packResources(params);
generateProject.generateProject(params);
