"use strict";
// module
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isNonEmptyString;
function isNonEmptyString(dataName, data) {
    if ("undefined" === typeof data) {
        return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
    }
    else if ("string" !== typeof data) {
        return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not a string"));
    }
    else if ("" === data.trim()) {
        return Promise.reject(new RangeError("\"" + dataName + "\" parameter is empty"));
    }
    else {
        return Promise.resolve();
    }
}
