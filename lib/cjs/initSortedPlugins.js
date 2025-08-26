"use strict";
// types & interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initSortedPlugins;
// private
// methods
function _initPlugin(plugin, emit, ...data) {
    emit("initializing", plugin, ...data);
    return plugin.init(...data).then(() => {
        emit("initialized", plugin, ...data);
        return Promise.resolve();
    });
}
function _initPlugins(pluginsToInit, emit, data, i = 0) {
    return i < pluginsToInit.length ? Promise.resolve().then(() => {
        return _initPlugin(pluginsToInit[i], emit, ...data);
        // loop
    }).then(() => {
        return _initPlugins(pluginsToInit, emit, data, i + 1);
    }) : Promise.resolve();
}
// module
function initSortedPlugins(plugins, orderedPluginsNames, emit, ...data) {
    // if no plugins, does not run
    return !plugins.length ? Promise.resolve() : Promise.resolve().then(() => {
        const sortedPlugins = [];
        orderedPluginsNames.forEach((pluginName) => {
            const plugin = plugins.find((p) => {
                return p.name === pluginName;
            });
            if (plugin) {
                sortedPlugins.push(plugin);
            }
        });
        // first, sorted plugins
        return sortedPlugins.length
            ? _initPlugins(sortedPlugins, emit, data)
            : Promise.resolve();
    }).then(() => {
        const unsortedPlugin = [
            ...plugins.filter((plugin) => {
                return !orderedPluginsNames.includes(plugin.name);
            }).sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return 0;
                }
            })
        ];
        // then, all other plugins, asynchronously
        return unsortedPlugin.length
            ? _initPlugins(unsortedPlugin, emit, data)
            : Promise.resolve();
    });
}
