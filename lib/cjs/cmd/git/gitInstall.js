"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gitInstall;
// natives
const node_path_1 = require("node:path");
// locals
const checkDirectory_1 = __importDefault(require("../../checkers/checkDirectory"));
const checkNonEmptyString_1 = __importDefault(require("../../checkers/checkNonEmptyString"));
const cmd_1 = __importDefault(require("../cmd"));
// module
function gitInstall(directory, user, repo) {
    return (0, checkNonEmptyString_1.default)("cmd/git/install/directory", directory).then(() => {
        return new Promise((resolve, reject) => {
            (0, checkDirectory_1.default)("cmd/git/install/directory", directory).then(() => {
                reject(new Error("\"" + directory + "\" aldready exists"));
            }).catch(() => {
                resolve();
            });
        });
    }).then(() => {
        return (0, checkNonEmptyString_1.default)("cmd/git/install/user", user);
    }).then(() => {
        return (0, checkNonEmptyString_1.default)("cmd/git/install/repo", repo);
    }).then(() => {
        // git clone
        return (0, cmd_1.default)((0, node_path_1.dirname)(directory), "git", [
            "-c",
            "core.quotepath=false",
            "clone",
            "--recursive",
            "--depth",
            "1",
            "https://github.com/" + user + "/" + repo + "/",
            directory
        ]);
    });
}
