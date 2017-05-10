#!/usr/bin/node
"use strict"

const childProcess = require("child_process");

function gen(argv) {
    console.log(argv);
    childProcess.execFile("flappy_gen.js", argv, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
    });
}

function init(argv) {
    console.log(argv);
    childProcess.execFile("flappy_gen.js", argv, (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
    });
}

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
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
