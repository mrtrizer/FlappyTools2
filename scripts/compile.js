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
    let args = process.argv.slice(2);
    let configFileName = args[0];
    let scriptFileName = args[1];

    let fs = require('fs');
    let configData = fs.readFileSync(configFileName, "utf8");
    let scriptData = fs.readFileSync(scriptFileName, "utf8");

    let params = JSON.parse(configData);
    console.log(compile(params, scriptData));
}
