#!/usr/bin/node
"use strict"

function flappyInit() {

}

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
        ['o', 'output-dir=ARG', 'Output dir.'],
        ['c', 'config=ARG', 'Config.'],
        ['t', 'template-dir=ARG', 'Template dir. Should contain generator.js.'],
        ['h', 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

}
