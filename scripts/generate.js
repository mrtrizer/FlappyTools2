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
                    outData += "\\n\\\n\t";
                else
                    outData += c;
                break;
            case "<":
                if (c == "?") {
                    outData += "\");\n"
                    state = "js"
                }
                if (c == "!") {
                    outData += "\" + ";
                    state = "js_insert";
                }
                break;
            case "js":
                if (c == "?")
                    state = "?";
                else
                    outData += c;
                break
            case "?":
                if (c == ">") {
                    outData += "\noutput(\"";
                    state = "text";
                }
                break;
            case "js_insert":
                if (c == "!")
                    state = "!";
                else
                    outData += c;
                break;
            case "!":
                if (c == ">") {
                    outData += " + \"";
                    state = "text";
                }
                break;
        }
    }
    outData += "\")";
    return outData;
}

let args = process.argv.slice(2);
let inputFileName = args[0];
let fs = require('fs');
let inputData = fs.readFileSync(inputFileName, "utf8");

let jsScript = generate(inputData);

console.log(jsScript);

