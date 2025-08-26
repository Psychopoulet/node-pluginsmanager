"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkAbsoluteDirectory;
// natives
const node_path_1 = require("node:path");
// locals
const checkDirectory_1 = __importDefault(require("./checkDirectory"));
// module
function checkAbsoluteDirectory(dataName, directory) {
    return (0, checkDirectory_1.default)(dataName, directory).then(() => {
        return new Promise((resolve, reject) => {
            return (0, node_path_1.isAbsolute)(directory) ? resolve() : reject(new Error("\"" + dataName + "\" (" + directory + ") is not an absolute path"));
        });
    });
}
