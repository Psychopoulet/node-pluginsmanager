"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// natives
const path_1 = require("path");
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
// locals
const checkOrchestrator_1 = __importDefault(require("./checkers/checkOrchestrator"));
const checkAbsoluteDirectory_1 = __importDefault(require("./checkers/checkAbsoluteDirectory"));
// module
function createPluginByDirectory(directory, externalRessourcesDirectory, logger) {
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
            return (0, node_pluginsmanager_plugin_1.checkFunction)("createPluginByDirectory/function", Plugin).then(() => {
                const pluginBaseNameDirectory = (0, path_1.basename)(directory);
                const plugin = new Plugin({
                    // usefull for inherited Orchestrators
                    "externalRessourcesDirectory": (0, path_1.join)(externalRessourcesDirectory, pluginBaseNameDirectory),
                    "logger": logger,
                    // useless, setted in inherited Orchestrators
                    "packageFile": "",
                    "descriptorFile": "",
                    "mediatorFile": "",
                    "serverFile": ""
                });
                return (0, checkOrchestrator_1.default)("createPluginByDirectory/orchestrator", plugin).then(() => {
                    plugin.name = pluginBaseNameDirectory;
                    return plugin.load().then(() => {
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
