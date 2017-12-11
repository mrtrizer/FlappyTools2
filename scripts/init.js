"use strict"

module.exports.getHelp = function() {
    return "flappy init <template> <project name> - Initialize new project with template."
}

function findAllInitScripts(globalContext) {
    let scriptObjectMap = {};
    for (const key in globalContext.scriptMap) {
        const script = globalContext.scriptMap[key];
        if ((typeof script.init === "function") && (typeof script.initName === "string")) {
            scriptObjectMap[script.initName] = script;
        }
    }
    return scriptObjectMap;
}

module.exports.runGlobal = function(globalContext) {
    if (globalContext.args.plainArgs.length < 2)
        throw new Error("Template and project name expected");
    const templateName = globalContext.args.plainArgs[0];
    const projectName = globalContext.args.plainArgs[1];

    const scriptObjectMap = findAllInitScripts(globalContext);
    if (scriptObjectMap.hasOwnProperty(templateName))
        scriptObjectMap[templateName].init(globalContext, projectName);
    else
        throw new Error(`Template with name "${templateName}" is not found`);
}
