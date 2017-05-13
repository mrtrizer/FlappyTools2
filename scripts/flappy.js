#!/usr/bin/node
"use strict"

const childProcess = require("child_process");
const path = require("path");
const scriptPath = path.dirname(require.main.filename);
const flappyGenPath = path.join(scriptPath, "flappy_gen.js");
const flappyInitPath = path.join(scriptPath, "flappy_gen.js");

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

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([])
    .parseSystem();

    switch (opt.argv[0]) {
        case "gen":
            gen(opt.argv.slice(1));
        break;
        case "init":
            init(opt.argv.slice(1));
        break;
    }
}
