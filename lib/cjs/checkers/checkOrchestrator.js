"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkOrchestrator;
// natives
const node_events_1 = __importDefault(require("node:events"));
// locals
const checkFunction_1 = __importDefault(require("./checkFunction"));
// module
function checkOrchestrator(dataName, data) {
    if ("undefined" === typeof data) {
        return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
    }
    else if ("object" !== typeof data || !(data instanceof node_events_1.default)) {
        return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Event"));
    }
    else {
        return (0, checkFunction_1.default)("isOrchestrator/load", data.load).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/destroy", data.destroy);
        }).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/init", data.init);
        }).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/release", data.release);
        }).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/install", data.install);
        }).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/update", data.update);
        }).then(() => {
            return (0, checkFunction_1.default)("isOrchestrator/uninstall", data.uninstall);
        });
    }
}
