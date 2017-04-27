#!/usr/bin/node
"use strict"

function compileString(config, templateData) {
    const compile_js = require("./compile.js");
    const generate_js = require("./generate_js.js");

    const generationScript = generate_js.generate(templateData);
    console.log("Script: \n" + generationScript);
    const compiledData = compile_js.compile(config, generationScript);
    console.log("Compiled file: \n" + compiledData);
    return compiledData;
}

function compileFile(config, filePath) {
    const fs = require("fs");

    const templateData = fs.readFileSync(filePath, 'utf8');
    console.log("In: " + filePath);
    return compileString(config, templateData);
}

function safeFile(path, data) {
    var fsPath = require('fs-path');
    console.log("Out: " + path);

    fsPath.writeFile(path, data, function(err){
        if(err) {
            throw err;
        }
    });
}

function compileDir(config, templatePath, outPath) {
    console.log(templatePath);
    const fs = require("fs");
    const path = require("path");

    if (!fs.lstatSync(templatePath).isDirectory()) {
        const data = compileFile(config, templatePath, outPath)
        safeFile(compileString(config, outPath), data);
        return;
    }
    fs.readdirSync(templatePath).forEach(fileName => {
        const nextFilePath = path.join(templatePath, fileName);
        const nextOutPath = path.join(outPath, fileName);
        compileDir(config, nextFilePath, nextOutPath);
    });
}

module.exports.compileDir = compileDir;

// If run as script
if (require.main == module) {
    const configPath = process.argv[2];
    const templatePath = process.argv[3];
    const outPath = process.argv[4];
    const fs = require("fs");
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData);
    compileDir(config, templatePath, outPath);
}
