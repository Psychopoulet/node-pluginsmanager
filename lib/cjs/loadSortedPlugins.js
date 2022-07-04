"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
// natives
const path_1 = require("path");
// locals
const createPluginByDirectory_1 = __importDefault(require("./createPluginByDirectory"));
// private
// methods
function _loadPlugin(globalDirectory, externalRessourcesDirectory, pluginFileName, loadedPlugins, emit, logger, ...data) {
    // is already loaded ?
    const plugin = loadedPlugins.find((p) => {
        return pluginFileName === p.name;
    });
    // is already exists ?
    return plugin ? Promise.resolve() : Promise.resolve().then(() => {
        emit("loading", pluginFileName, ...data);
        const directory = (0, path_1.join)(globalDirectory, pluginFileName);
        return (0, createPluginByDirectory_1.default)(directory, externalRessourcesDirectory, logger, ...data);
        // emit event
    }).then((createdPlugin) => {
        emit("loaded", createdPlugin, ...data);
        loadedPlugins.push(createdPlugin);
        return Promise.resolve();
    });
}
function _loadPlugins(globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data, i = 0) {
    return i < pluginsToLoad.length ? Promise.resolve().then(() => {
        return _loadPlugin(globalDirectory, externalRessourcesDirectory, pluginsToLoad[i], loadedPlugins, emit, logger, ...data);
        // loop
    }).then(() => {
        return _loadPlugins(globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data, i + 1);
    }) : Promise.resolve();
}
// module
function loadSortedPlugins(globalDirectory, externalRessourcesDirectory, files, loadedPlugins, orderedPluginsNames, emit, logger, ...data) {
    // if no files, does not run
    return !files.length ? Promise.resolve() : Promise.resolve().then(() => {
        const sortedPluginsNames = [
            ...files.filter((pluginName) => {
                return orderedPluginsNames.includes(pluginName);
            })
        ];
        // first, sorted plugins
        return sortedPluginsNames.length ?
            _loadPlugins(globalDirectory, externalRessourcesDirectory, sortedPluginsNames, loadedPlugins, emit, logger, data) :
            Promise.resolve();
    }).then(() => {
        const unsortedPluginsNames = [
            ...files.filter((pluginName) => {
                return !orderedPluginsNames.includes(pluginName);
            }).sort((a, b) => {
                if (a < b) {
                    return -1;
                }
                else if (a > b) {
                    return 1;
                }
                else {
                    return 0;
                }
            })
        ];
        // then, all other plugins, asynchronously
        return unsortedPluginsNames.length ?
            _loadPlugins(globalDirectory, externalRessourcesDirectory, unsortedPluginsNames, loadedPlugins, emit, logger, data) :
            Promise.resolve();
    });
}
exports.default = loadSortedPlugins;
;
