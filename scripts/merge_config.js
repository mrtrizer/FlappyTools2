#!/usr/bin/node
"use strict"

function parseJson(fileList) {
    let outParams = {};
    fileList.forEach(function (val, index, array) {
        let fs = require('fs');
        let data = fs.readFileSync(val, 'utf8');
        let jsonObj = JSON.parse(data);
        // recursive iterate json tree
        let jsonIterate = function (jsonObj, outObject) {
            for (let key in jsonObj) {
                let item = jsonObj[key];
                if (typeof item == "object") {
                    if (!outObject.hasOwnProperty(key))
                        outObject[key] = {};
                    else if (typeof outObject[key] != "object")
                        outObject[key] = {};
                    jsonIterate(item, outObject[key]);
                } else {
                    outObject[key] = item;
                }
            };
        };
        jsonIterate(jsonObj, outParams);
    });
    return outParams;
}

module.exports.parseJson = parseJson;

// If run as script
if (require.main == module) {
    const opt = require('node-getopt').create([
      ['h' , 'help', 'Display this help.'],
    ])
    .setHelp("Usage: node merge_config.js <config> ...\n\n[[OPTIONS]]")
    .bindHelp()
    .parseSystem();

    let fileList = opt.argv;

    console.log(JSON.stringify(parseJson(fileList)));
}
