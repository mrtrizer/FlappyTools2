#!/usr/bin/nodejs
"use strict"

module.exports.generate = function(context) {
    const path = require("path");
    context.compileDir(context, path.join(context.templatePath, "template"), context.outDir);
}

