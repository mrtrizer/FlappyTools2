#!/usr/bin/env node
"use strict"

const utils = require("./utils.js");
const pack_resources = require("./pack_resources.js");
const path = require("path");
const fs = require("fs");

const opt = require('node-getopt').create([
    ['o', 'output-dir=ARG', 'Output dir.'],
    ['h', 'help', 'Display this help.'],
])
.bindHelp()
.parseSystem();

if (opt.argv.length < 1) {
    console.log("flappy pack-res <template>");
    return;
}

const workingDir = process.cwd();
const projectRoot = utils.findProjectRoot(workingDir);

const projectOutDir = opt.options["output-dir"];
const templateName = opt.argv[0];

const configOrder = opt.argv.slice(1);

var params = utils.findParams(projectRoot, templateName, projectOutDir, configOrder, []);
pack_resources.packResources(params);