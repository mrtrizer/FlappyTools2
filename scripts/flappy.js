#!/usr/bin/node
"use strict"


// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    if (opt.argv[0] == "gen")
        // call flappy_gen
    if (opt.argv[0] == "init")
        // call flappy_init
}
