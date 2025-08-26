"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gitUpdate;
// locals
const checkDirectory_1 = __importDefault(require("../../checkers/checkDirectory"));
const cmd_1 = __importDefault(require("../cmd"));
// module
function gitUpdate(directory) {
    return (0, checkDirectory_1.default)("cmd/git/update/directory", directory).then(() => {
        // git update
        return (0, cmd_1.default)(directory, "git", ["pull"]);
    });
}
