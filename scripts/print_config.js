"use strict"

module.exports.getHelp = function() {
    return "flappy print_config - Print current config";
}

module.exports.run = function(context) {
    console.log(context.config);
}

