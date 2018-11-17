"use strict"

module.exports.getHelp = function() {
    return "flappy print_scripts - Get list of avaliable scripts";
}

module.exports.run = function(context) {
    console.log(JSON.stringify(context.scriptMap, null, 2));
}
