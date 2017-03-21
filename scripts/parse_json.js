#!/usr/bin/node

let args = process.argv.slice(2);
let outParamList = {};

args.forEach(function (val, index, array) {
    let fs = require('fs');
    let data = fs.readFileSync(val, 'utf8');
    jsonObj = JSON.parse(data);
    jsonIterate = function (jsonObj, path) {
        for (key in jsonObj) {
            let item = jsonObj[key];
            if (typeof item == "object")
                jsonIterate(item, path + key + ".");
            else
                outParamList[path + key] = item;
        };
    };
    jsonIterate(jsonObj, "");
});

for (key in outParamList)
    console.log(key + ":" + JSON.stringify(outParamList[key]));
