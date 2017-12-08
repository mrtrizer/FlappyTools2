"use strict"

class TimestampCache {
    constructor(context) {
        const path = require('path');
        const fse = require('fs-extra');
        this.timestampCachePath = path.join(context.projectRoot, "flappy_cache/timestamps.json");
        try {
            this.timestamps = fse.readJsonSync(this.timestampCachePath);
        } catch (e) {
            this.timestamps = {};
        }
    }

    isChanged(path) {
        const fs = require('fs');
        const fse = require('fs-extra');
        const lastModifTime = Math.floor(fs.statSync(path).mtime);
        if (!(path in this.timestamps) || this.timestamps[path] != lastModifTime) {
            console.log(path + " - Changed : " + lastModifTime);
            this.timestamps[path] = lastModifTime;
            fse.outputJsonSync(this.timestampCachePath, this.timestamps, {spaces: 4});
            return true;
        }
        return false;
    }
}

module.exports.TimestampCache = TimestampCache;
