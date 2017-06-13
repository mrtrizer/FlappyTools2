#!/usr/bin/env node --harmony
"use strict"

const childProcess = require("child_process");
const path = require("path");
const scriptPath = path.dirname(require.main.filename);
const flappyGenPath = path.join(scriptPath, "flappy_gen.js");
const flappyInitPath = path.join(scriptPath, "flappy_init.js");
const flappyBuildPath = path.join(scriptPath, "flappy_build.js");

function call(command, argv) {
    childProcess.execFile(command, argv, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error != null)
            throw error;
    });
}

function printHelp() {
    console.log("Options:");
    console.log("\tflappy --help - Print current help message");
    console.log("\tflappy <command name> --help - For details about command");
    console.log("\tflappy gen <template name> - Generate project for current project dir");
    console.log("\tflappy build <template name> - Generate project for current project dir and build it.");
    console.log("\tflappy init <template name> <project name> - Generate flappy project with template and project name. "
                + "New project folder with will be created");
}

const argv = process.argv.slice(2);

if (argv.length < 1)
    printHelp();

switch (argv[0]) {
    case "gen":
        call(flappyGenPath, argv.slice(1));
    break;
    case "init":
        call(flappyInitPath, argv.slice(1));
    break;
    case "build":
        call(flappyBuildPath, argv.slice(1));
    break;
    case "--help":
    case "-h":
       printHelp(); 
    break;
}
