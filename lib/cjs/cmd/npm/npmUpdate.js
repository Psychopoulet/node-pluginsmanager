"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = npmUpdate;
// locals
const npmCmd_1 = __importDefault(require("./npmCmd"));
// module
function npmUpdate(directory) {
    return (0, npmCmd_1.default)(directory, ["update", "--prod"]);
}
