"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = npmUpdate;
// locals
const cmd_1 = __importDefault(require("../cmd"));
// module
function npmUpdate(directory) {
    return (0, cmd_1.default)(directory, "npm", ["update", "--omit=dev", "--no-optional"]);
}
