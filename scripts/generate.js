#!/usr/bin/node


function generate(inputData) {
    let outData = "console.log(\"";

    let state = "text"

    for(var x = 0, c=''; c = inputData.charAt(x); x++){
        switch (state) {
            case "text":
                if (c == "<")
                    state = "<"
                else if (c == "\n")
                    outData += "\\n\\\n";
                else
                    outData += c;
                break;
            case "js":
                if (c == "?")
                    state = "?";
                else
                    outData += c;
                break
            case "<":
                if (c == "?") {
                    outData += "\");\n"
                    state = "js"
                }
                break;
            case "?":
                if (c == ">") {
                    outData += "\nconsole.log(\"";
                    state = "text";
                }
                break;
        }
    }
    outData += "\")";
    return outData;
}

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
let inputFileName = args[0];
let outFileName = args[1];

let fs = require('fs');
let inputData = fs.readFileSync(inputFileName, "utf8");

let rawParams = {"test.first":2, "test.second.third":"test"};
let outData = generate(inputData);
let params = {};

for (rawParam in rawParams) {
    addProperty(params, rawParam, rawParams[rawParam]);
}

console.log(outData);

console.log(params)
with (params)
    eval (outData);
