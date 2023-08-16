"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// natives
const node_fs_1 = require("node:fs");
// locals
const checkNonEmptyString_1 = __importDefault(require("./checkNonEmptyString"));
// module
function checkDirectory(dataName, directory) {
    return (0, checkNonEmptyString_1.default)(dataName, directory).then(() => {
        return new Promise((resolve) => {
            (0, node_fs_1.lstat)(directory, (err, stats) => {
                return resolve(Boolean(!err && stats.isDirectory()));
            });
        });
    }).then((exists) => {
        return exists ? Promise.resolve() : Promise.reject(new Error("\"" + dataName + "\" (" + directory + ") is not a valid directory"));
    });
}
exports.default = checkDirectory;
;
