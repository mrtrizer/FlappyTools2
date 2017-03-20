#!/usr/bin/node

let args = process.argv.slice(2);
let inputFile = args[0];
let outFile = args[1];

let fs = require('fs');
let inputData = fs.readFileSync(inputFile, "utf8");
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

console.log (outData);
eval (outData);
