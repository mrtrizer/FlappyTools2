#!/usr/bin/node
"use strict"

const utils = require("./utils.js");
const generateProject = require("./generate_project.js");

const opt = require('node-getopt').create([
    ['h', 'help', 'Display this help.'],
])
.bindHelp()
.parseSystem();

const path = require("path");

if (opt.argv.length < 1) {
    console.log("flappy build <template>");
    return;
}

const workingDir = process.cwd();
const projectRoot = utils.findProjectRoot(workingDir);

const projectOutDir = opt.options["output-dir"];
const templateName = opt.argv[0];

const configOrder = opt.argv.slice(1);

var params = utils.findParams(projectRoot, templateName, projectOutDir, configOrder, []);
generateProject.buildProject(params);

