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

module.exports.findGenerator = function(context, generatorName) {
    const generators = module.exports.findAllGeneratorScripts(context);

    if (generators.hasOwnProperty(generatorName)) {
        const generator = generators[generatorName];
        return generator;
    } else {
        throw new Error(`Can't find generator with name "${templateName}".`);
    }
}

module.exports.runGenerator = function(context, generatorName, funcName) {
    const generator = module.exports.findGenerator(context, generatorName);
    generator[funcName](context);
}
