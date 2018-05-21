"use strict"

// Adds items to array field of outObject if key of jsonObject starts from "+"
function jsonIterate (jsonObj, outObject) {
    for (let key in jsonObj) {
        let item = jsonObj[key];
        if (Array.isArray(item)) {
            if (key[0] == "+") {
                const fieldName = key.slice(1);
                if (Array.isArray(outObject[fieldName]))
                    outObject[fieldName] = outObject[fieldName].concat(item);
            } else {
                outObject[key] = item;
            }
        } else if (typeof item == "object") {
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

function parseJson(fileList, extraParams) {
    const fs = require("fs");
    const logger = require("./logger.js")

    let outParams = {};
    fileList.forEach(function (val, index, array) {
        try {
            const data = fs.readFileSync(val, 'utf8');
            try {
                const jsonObj = JSON.parse(data);
                // recursive iterate json tree
                jsonIterate(jsonObj, outParams);
            } catch (e) {
                logger.loge("Config syntax error. File: " + val + " Error: " + e.message);
                return;
            }
        } catch (e) {
            return;
        }
    });
    if (extraParams != undefined)
        jsonIterate(extraParams, outParams);
    return outParams;
}

module.exports.parseJson = parseJson;
