"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// natives
const node_path_1 = require("node:path");
// locals
const checkAbsoluteDirectory_1 = __importDefault(require("./checkers/checkAbsoluteDirectory"));
const checkOrchestrator_1 = __importDefault(require("./checkers/checkOrchestrator"));
const checkFunction_1 = __importDefault(require("./checkers/checkFunction"));
// module
function createPluginByDirectory(directory, externalRessourcesDirectory, logger, ...data) {
    return (0, checkAbsoluteDirectory_1.default)("createPluginByDirectory/directory", directory).then(() => {
        return (0, checkAbsoluteDirectory_1.default)("createPluginByDirectory/externalRessourcesDirectory", externalRessourcesDirectory);
    }).then(() => {
        return new Promise((resolve, reject) => {
            try {
                resolve(require(directory));
            }
            catch (e) {
                reject(e);
            }
        }).then((Plugin) => {
            if (Plugin.Orchestrator) {
                return Promise.resolve(Plugin.Orchestrator);
            }
            else if (Plugin.default) {
                return Promise.resolve(Plugin.default);
            }
            else {
                return Promise.resolve(Plugin);
            }
        }).then((Plugin) => {
            return (0, checkFunction_1.default)("createPluginByDirectory/function", Plugin).then(() => {
                const pluginBaseNameDirectory = (0, node_path_1.basename)(directory);
                const plugin = new Plugin({
                    // usefull for inherited Orchestrators
                    "externalRessourcesDirectory": (0, node_path_1.join)(externalRessourcesDirectory, pluginBaseNameDirectory),
                    "logger": logger,
                    // useless, setted in inherited Orchestrators
                    "packageFile": "",
                    "descriptorFile": "",
                    "mediatorFile": "",
                    "serverFile": ""
                });
                return (0, checkOrchestrator_1.default)("createPluginByDirectory/orchestrator", plugin).then(() => {
                    plugin.name = pluginBaseNameDirectory;
                    return plugin.load(...data).then(() => {
                        return plugin.name === pluginBaseNameDirectory ? Promise.resolve() : Promise.reject(new Error("Plugin's name (\"" + plugin.name + "\") does not fit with plugin's directory basename (\"" + pluginBaseNameDirectory + "\")"));
                    });
                }).then(() => {
                    return Promise.resolve(plugin);
                });
            });
        });
    });
}
exports.default = createPluginByDirectory;
;
