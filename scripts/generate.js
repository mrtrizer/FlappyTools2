#!/usr/bin/node
"use strict"

//Script generates javascript code from template file

function genTabs(tabN) {
    let result = "";
    while (tabN > 0) {
        result += "    ";
        tabN -= 1;
    }
    return result;
}

function generate(inputData) {
    let outData = "\"use strict\"\n" ;
    outData += "output(\"";

    let lineStart = false;
    let tabN = 0;
    let state = "text"

    for(var x = 0, c=''; c = inputData.charAt(x); x++){
        switch (state) {
            case "text":
                if (c == "<")
                    state = "<";
                else if (c == "\n")
                    outData += "\\n\" + \n" + genTabs(tabN) + "        \"";
                else if (c == "[") {
                    state = "[";
                    outData += "\");\n" + genTabs(tabN) + "output("
                } else
                    outData += c;
                break;
            case "<":
                if (c == "?") {
                    outData += "\");\n"
                    state = "js_line_start"
                }
                break;
            case "js_line_start":
                if (c != " ") {
                    state = "js";
                } else {
                    break;
                }
            case "js":
                if (c == "\n") {
                    state = "js_line_start";
                    outData += "\n";
                } else if (c == "?")
                    state = "?";
                else if (c == "{") {
                    tabN++;
                    outData += "{";
                } else if (c == "}") {
                    tabN--;
                    outData += "}";
                } else
                    outData += c;
                break
            case "?":
                if (c == ">") {
                    outData += "\n" + genTabs(tabN) + "output(\"";
                    state = "text";
                }
                break;
            case "[":
                if (c == "\n")
                    ;// skip
                else if (c == "]") {
                    outData += ");\n" + genTabs(tabN) + "output(\""
                    state = "text";
                } else {
                    outData += c;
                }
                break;
        }
    }
    outData += "\");";
    return outData;
}

module.exports.generate = generate;

// Script
let args = process.argv.slice(2);
let inputFileName = args[0];
let fs = require('fs');
let inputData = fs.readFileSync(inputFileName, "utf8");

let jsScript = generate(inputData);

console.log(jsScript);

