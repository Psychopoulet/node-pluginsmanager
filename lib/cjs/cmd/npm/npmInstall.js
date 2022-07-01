"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// locals
const npmCmd_1 = __importDefault(require("./npmCmd"));
// module
function npmInstall(directory) {
    return (0, npmCmd_1.default)(directory, ["install", "--prod"]);
}
exports.default = npmInstall;
;
