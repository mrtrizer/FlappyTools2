#!/usr/bin/node
"use strict"


function compile(params, scriptData) {
    const vm = require('vm');
    let outString = "";

    // Set method for output
    params.output = str => outString += str;

    let context = vm.createContext(params);
    vm.runInContext(scriptData, context);
    return outString;
}

module.exports.compile = compile;

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
      ['c' , 'config=ARG'   , 'Config.'],
      ['s' , 'script=ARG'   , 'Script.'],
      ['h' , 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    let configFileName = opt.options["config"];
    let scriptFileName = opt.options["script"];

    let fs = require('fs');
    let configData = fs.readFileSync(configFileName, "utf8");
    let scriptData = fs.readFileSync(scriptFileName, "utf8");

    let params = JSON.parse(configData);
    console.log(compile(params, scriptData));
}
