#!/usr/bin/node
"use strict"

const vm = require('vm');

let args = process.argv.slice(2);
let configFileName = args[0];
let scriptFileName = args[1];

let fs = require('fs');
let configData = fs.readFileSync(configFileName, "utf8");
let scriptData = fs.readFileSync(scriptFileName, "utf8");

let params = JSON.parse(configData);

// Set method for output
params.output = str => console.log(str);

console.log(JSON.stringify(params));

let strictModeScript = "\"use strict\"\n" + scriptData;
let context = vm.createContext(params);
vm.runInContext(strictModeScript, context);
