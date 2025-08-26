"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = npmCmd;
// locals
const checkDirectory_1 = __importDefault(require("../../checkers/checkDirectory"));
const cmd_1 = __importDefault(require("../cmd"));
// module
function npmCmd(directory, params) {
    return (0, checkDirectory_1.default)("cmd/npm/cmd/directory", directory).then(() => {
        // npm install
        return (0, cmd_1.default)(directory, (/^win/).test(process.platform) ? "npm.cmd" : "npm", params);
    });
}
