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
        const procSymbol = function (c) {
            if (c == bracketOpen) {
                state = "bracket_open";
            } else if (c == "\n") {
                outData += "\\n\" + \n        \"";
            } else if (c == "\"") {
                outData += "\\\""
            } else {
                outData += c;
            }
        }

        switch (state) {
            case "text":
                procSymbol(c);
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
                    outData += bracketOpen;
                    procSymbol(c);
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
                    procSymbol(c);
                    state = "js";
                }
                break;
            case "inline_end_marker":
                if (c == bracketClose) {
                    outData += ") + \"";
                    state = "text";
                } else {
                    outData += inlineMarker;
                    procSymbol(c);
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
