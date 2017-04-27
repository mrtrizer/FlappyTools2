#!/usr/bin/node
"use strict"

//Script generates javascript code from template file

function generate(inputData) {
    let outData = "\"use strict\"\n" ;
    outData += "output(\"";

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
                    outData += "\");\n output("
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
                    outData += "\n output(\"";
                    state = "text";
                } else {
                    outData += codeBlockMarker;
                    state = "js"
                }
                break;
            case "inline":
                if (c == "\n")
                    ;// skip
                else if (c == bracketClose) {
                    outData += ");\n output(\""
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

