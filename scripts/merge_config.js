"use strict"

function jsonIterate (jsonObj, outObject) {
    for (let key in jsonObj) {
        let item = jsonObj[key];
        if (Array.isArray(item)) {
            outObject[key] = item;
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
    let fs = require('fs');

    let outParams = {};
    fileList.forEach(function (val, index, array) {
        try {
            const data = fs.readFileSync(val, 'utf8');
            const jsonObj = JSON.parse(data);
            // recursive iterate json tree
            jsonIterate(jsonObj, outParams);
        } catch (e) {
            console.log("ERROR: Can't read config " + val);
            console.log(e.message);
            return;
        }
    });
    if (extraParams != undefined)
        jsonIterate(extraParams, outParams);
    return outParams;
}

module.exports.parseJson = parseJson;
