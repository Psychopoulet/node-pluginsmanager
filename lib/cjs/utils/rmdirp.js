"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rmdirp;
// natives
const promises_1 = require("node:fs/promises");
// locals
const isDirectory_1 = __importDefault(require("./isDirectory"));
// module
function rmdirp(directory) {
    return (0, isDirectory_1.default)(directory).then((exists) => {
        return exists ? (0, promises_1.rm)(directory, {
            "recursive": true
        }) : Promise.resolve();
    });
}
