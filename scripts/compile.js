#!/usr/bin/node

function addProperty(object, key, value) {
    var orig_object = object;
    var keys = key.split('.');

    for (var i = 0; i < keys.length - 1; i++) {
        var k = keys[i];
        if (!object.hasOwnProperty(k)) {
            object[k] = {};
            object = object[k];
        }
    }

    object[keys.slice(-1)] = value;

    return orig_object;
}

let args = process.argv.slice(2);
let configFileName = args[0];
let scriptFileName = args[1];

let fs = require('fs');
let configData = fs.readFileSync(configFileName, "utf8");
let scriptData = fs.readFileSync(scriptFileName, "utf8");

let jsonConfigData = configData.replace(/^(.*?):/mg, "\"$1\":");
jsonConfigData = "{" + jsonConfigData.replace(/\n/g, ",").slice(0, -1) + "}";


let rawParams = JSON.parse(jsonConfigData);
let params = {};

for (rawParam in rawParams) {
    addProperty(params, rawParam, rawParams[rawParam]);
}

// Set method for output
params.output = str => console.log(str);

with (params)
    eval (scriptData);
