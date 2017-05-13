#!/usr/bin/node
"use strict"

//Script generates javascript code from template file

function generate(inputData) {
    let outData = "\"use strict\"\n" ;
    outData += "print(\"";

    let lineStart = false;
    let state = "text";
    const bracketOpen = "[";
    const bracketClose = "]";
    const inlineMarker = "=";
    const codeBlockMarker = "%";

    for(var x = 0, c=''; c = inputData.charAt(x); x++){
        switch (state) {
            case "text":
                if (c == bracketOpen) {
                    state = "bracket_open";
                } else if (c == "\n") {
                    outData += "\\n\" + \n        \"";
                } else if (c == "\"") {
                    outData += "\\\""
                } else {
                    outData += c;
                }
                break;
            case "bracket_open":
                if (c == codeBlockMarker) {
                    outData += "\");\n"
                    state = "js"
                } else if (c == inlineMarker) {
                    state = "inline";
                    outData += "\" + ("
                } else {
                    state = "text";
                    outData += c;
                }
                break;
            case "js":
                if (c == codeBlockMarker) {
                    state = "block_end_marker";
                } else {
                    outData += c;
                }
                break
            case "block_end_marker":
                if (c == bracketClose) {
                    outData += "\n print(\"";
                    state = "text";
                } else {
                    outData += codeBlockMarker;
                    outData += c;
                    state = "js";
                }
                break;
            case "inline_end_marker":
                if (c == bracketClose) {
                    outData += ") + \"";
                    state = "text";
                } else {
                    outData += inlineMarker;
                    outData += c;
                    state = "inline";
                }
                break;
            case "inline":
                if (c == "\n")
                    ;// skip
                else if (c == inlineMarker) {
                    state = "inline_end_marker";
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

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
      ['t' , 'template-file=ARG'   , 'Template file.'],
      ['h' , 'help', 'Display this help.'],
    ])
    .bindHelp()
    .parseSystem();

    const inputFileName = opt.options["template-file"];
    const fs = require('fs');
    const inputData = fs.readFileSync(inputFileName, "utf8");
    const jsScript = generate(inputData);

    console.log(jsScript);
}

