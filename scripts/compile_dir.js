"use strict"

function compileString(config, templateData) {
    const compile_js = require("./compile.js");
    const generate_js = require("./generate_js.js");

    const generationScript = generate_js.generate(templateData);
    //console.log("Script: \n" + generationScript);
    const compiledData = compile_js.compile(config, generationScript);
    return compiledData;
}

function compileFile(config, filePath) {
    const fs = require("fs");

    const templateData = fs.readFileSync(filePath, 'utf8');
    //console.log("In: " + filePath);
    return compileString(config, templateData);
}

function saveFile(path, data) {
    var fsPath = require('fs-path');
    //console.log("Out: " + path);

    fsPath.writeFileSync(path, data);
}

function compileDir(config, templatePath, outPath) {
    console.log(templatePath);
    const fs = require("fs");
    const path = require("path");

    config.templatePath = templatePath;

    if (!fs.lstatSync(templatePath).isDirectory()) {
        const data = compileFile(config, templatePath, outPath)
        saveFile(compileString(config, outPath), data);
        return;
    }
    fs.readdirSync(templatePath).forEach(fileName => {
        const nextFilePath = path.join(templatePath, fileName);
        const nextOutPath = path.join(outPath, fileName);
        compileDir(config, nextFilePath, nextOutPath);
    });
}

module.exports.compileDir = compileDir;
