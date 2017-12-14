"use strict"

function compile(context, scriptData) {
    const vm = require('vm');
    let outString = "";

    // Set method for output
    context.print = str => outString += str;
    context.log = console.log;

    let vmContext = vm.createContext(context);
    vm.runInContext(scriptData, vmContext);
    return outString;
}

module.exports.compile = compile;
