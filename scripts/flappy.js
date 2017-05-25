#!/usr/bin/node
"use strict"

const childProcess = require("child_process");
const path = require("path");
const scriptPath = path.dirname(require.main.filename);
const flappyGenPath = path.join(scriptPath, "flappy_gen.js");
const flappyInitPath = path.join(scriptPath, "flappy_init.js");

function gen(argv) {
    childProcess.execFile(flappyGenPath, argv, (error, stdout, stderr) => {
        if (error != null)
            throw error;
        console.log(stdout);
        console.log(stderr);
    });
}

function init(argv) {
    childProcess.execFile(flappyInitPath, argv, (error, stdout, stderr) => {
        if (error != null)
            throw error;
        console.log(stdout);
        console.log(stderr);
    });
}

function printHelp() {
    console.log("Options:");
    console.log("\tflappy --help - Print current help message");
    console.log("\tflappy <command name> --help - For details about command");
    console.log("\tflappy gen <template name> - Generate project for current project dir");
    console.log("\tflappy init <template name> <project name> - Generate flappy project with template and project name. "
                + "New project folder with will be created");
}

const argv = process.argv.slice(2);

if (argv.length < 1)
    printHelp();

switch (argv[0]) {
    case "gen":
        gen(argv.slice(1));
    break;
    case "init":
        init(argv.slice(1));
    break;
    case "--help":
    case "-h":
       printHelp(); 
    break;
}
