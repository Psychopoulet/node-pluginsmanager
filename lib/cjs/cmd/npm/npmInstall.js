"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = npmInstall;
// locals
const cmd_1 = __importDefault(require("../cmd"));
// module
function npmInstall(directory) {
    return (0, cmd_1.default)(directory, "npm", ["install", "--omit=dev", "--no-optional"]);
}
