"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cmd;
// natives
const node_child_process_1 = require("node:child_process");
// locals
const checkDirectory_1 = __importDefault(require("../checkers/checkDirectory"));
const checkNonEmptyArray_1 = __importDefault(require("../checkers/checkNonEmptyArray"));
const checkNonEmptyString_1 = __importDefault(require("../checkers/checkNonEmptyString"));
const stdToString_1 = __importDefault(require("./stdToString"));
// module
function cmd(directory, command, params) {
    return (0, checkDirectory_1.default)("cmd/directory", directory).then(() => {
        return (0, checkNonEmptyString_1.default)("cmd/command", command);
    }).then(() => {
        return (0, checkNonEmptyArray_1.default)("cmd/params", params);
    }).then(() => {
        return new Promise((resolve, reject) => {
            let result = "";
            const mySpawn = (0, node_child_process_1.spawn)(command, params, {
                "cwd": directory,
                "windowsHide": true,
                "shell": true
            }).on("error", (err) => {
                result += (0, stdToString_1.default)(err);
            }).on("close", (code) => {
                return code ? reject(new Error(result)) : resolve();
            });
            mySpawn.stderr.on("data", (msg) => {
                result += (0, stdToString_1.default)(msg);
            });
        });
    });
}
