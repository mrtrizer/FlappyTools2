"use strict"

function absolutePath (basePath, pathList) {
    if (Array.isArray(pathList)) {
        let outPathList = [];
        for (let i in pathList) {
            outPathList.push(absolutePath(basePath, pathList[i]));
        }
        return outPathList;
    } else {
        const path = require("path");
        return path.normalize(path.join(basePath, pathList));
    }
}

module.exports.absolutePath = absolutePath;
