"use strict"

module.exports.findAllGeneratorScripts = function(context) {
    let scriptObjectMap = {};
    for (const key in context.scriptMap) {
        const script = context.requireFlappyScript(key);
        if (typeof script.generatorName === "string") {
            scriptObjectMap[script.generatorName] = script;
        }
    }
    return scriptObjectMap;
}

module.exports.runGenerator = function(context, templateName, funcName) {
    const generators = module.exports.findAllGeneratorScripts(context);

    if (generators.hasOwnProperty(templateName)) {
        const generator = generators[templateName];
        generator[funcName](context);
    } else {
        throw new Error(`Can't find generator with name "${templateName}".`);
    }
}
