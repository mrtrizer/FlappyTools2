#!/usr/bin/node
"use strict"

let args = process.argv.slice(2);
let outParams = {};

args.forEach(function (val, index, array) {
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

console.log(JSON.stringify(outParams));
