"use strict"

module.exports.getInitHelp = function() {
    return "Initializes the simplest minial cpp project.";
}

module.exports.init = function(globalContext, projectName) {
    const path = require("path");
    const compileDir = globalContext.requireFlappyScript("compile_dir");
    const utils = globalContext.requireFlappyScript("utils");

    const templatePath = path.join(__dirname, "template");
    const outDir = path.join(globalContext.workingDir, projectName);
    globalContext["config"].name = projectName;
    compileDir.compileDir(globalContext, templatePath, outDir);
}

module.exports.initName = "cpp"
