"use strict"

class FlappyArgs {
    constructor(argv) {
        this.args = [];
        this.configOrder = [];
        this.longKeys = [];
        this.shortKeys = [];
        this.extraParams = {};

        for (const i in argv) {
            const arg = argv[i];
            if (arg.trim()[0] == "+") {
                this.configOrder.push(arg.substr(1));
            } else if (arg.trim()[0] == ".") {
                const fieldPairSplit = arg.substr(1).split("=");
                this.extraParams[fieldPairSplit[0]] = fieldPairSplit[1];
            } else if (arg[0] == '-') {
                if (arg[1] == '-')
                    this.longKeys.push(arg.slice(2));
                else
                    this.shortKeys.push(arg.slice(1));
            } else {
                this.args.push(arg);
            }
        }
    }

    isPresented(longKey, shortKey) {
        return this.longKeys.indexOf(longKey) != -1
               || this.shortKeys.indexOf(shortKey) != -1;
    }
}

module.exports.FlappyArgs = FlappyArgs;
