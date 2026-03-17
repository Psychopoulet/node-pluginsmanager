"use strict";
/*
    eslint-disable @typescript-eslint/no-base-to-string
*/
// => @typescript-eslint/no-base-to-string is disabled to force stringifying a potential object
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = stdToString;
// module
function stdToString(msg) {
    if ("object" !== typeof msg) {
        return String(msg);
    }
    else if (msg instanceof Buffer) {
        return msg.toString("utf8");
    }
    else if (msg.message) {
        return msg.message;
    }
    else {
        return String(msg);
    }
}
