"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// natives
const node_fs_1 = require("node:fs");
// module
function isDirectory(directory) {
    return new Promise((resolve, reject) => {
        if ("undefined" === typeof directory) {
            reject(new ReferenceError("missing \"directory\" argument"));
        }
        else if ("string" !== typeof directory) {
            reject(new TypeError("\"directory\" argument is not a string"));
        }
        else if ("" === directory.trim()) {
            reject(new Error("\"directory\" argument is empty"));
        }
        else {
            (0, node_fs_1.lstat)(directory, (err, stats) => {
                return resolve(Boolean(!err && stats.isDirectory()));
            });
        }
    });
}
exports.default = isDirectory;
;
