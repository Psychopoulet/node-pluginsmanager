"use strict";
// deps
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// natives
const node_events_1 = __importDefault(require("node:events"));
const node_path_1 = require("node:path");
const node_os_1 = require("node:os");
const promises_1 = require("node:fs/promises");
// externals
const check_version_modules_1 = __importDefault(require("check-version-modules"));
// locals
const rmdirp_1 = __importDefault(require("./utils/rmdirp"));
const checkAbsoluteDirectory_1 = __importDefault(require("./checkers/checkAbsoluteDirectory"));
const checkFunction_1 = __importDefault(require("./checkers/checkFunction"));
const checkNonEmptyArray_1 = __importDefault(require("./checkers/checkNonEmptyArray"));
const checkNonEmptyString_1 = __importDefault(require("./checkers/checkNonEmptyString"));
const checkOrchestrator_1 = __importDefault(require("./checkers/checkOrchestrator"));
const createPluginByDirectory_1 = __importDefault(require("./createPluginByDirectory"));
const loadSortedPlugins_1 = __importDefault(require("./loadSortedPlugins"));
const initSortedPlugins_1 = __importDefault(require("./initSortedPlugins"));
const extractGithub_1 = __importDefault(require("./extractGithub"));
// git
const gitInstall_1 = __importDefault(require("./cmd/git/gitInstall"));
const gitUpdate_1 = __importDefault(require("./cmd/git/gitUpdate"));
// npm
const npmInstall_1 = __importDefault(require("./cmd/npm/npmInstall"));
const npmUpdate_1 = __importDefault(require("./cmd/npm/npmUpdate"));
// consts
const DEFAULT_PLUGINS_DIRECTORY = (0, node_path_1.join)((0, node_os_1.homedir)(), "node-pluginsmanager-plugins");
const DEFAULT_RESOURCES_DIRECTORY = (0, node_path_1.join)((0, node_os_1.homedir)(), "node-pluginsmanager-resources");
// module
class PluginsManager extends node_events_1.default {
    // attributes
    // protected
    _beforeLoadAll;
    _beforeInitAll;
    _logger;
    _orderedPluginsNames;
    // public
    directory; // plugins location (must be writable). default : join(homedir(), "node-pluginsmanager-plugins")
    externalResourcesDirectory; // external resources locations (sqlite, files, cache, etc...) (must be writable). default : join(homedir(), "node-pluginsmanager-resources")
    plugins; // plugins' Orchestrators
    // constructor
    constructor(options) {
        super();
        // protected
        this._beforeLoadAll = null;
        this._beforeInitAll = null;
        this._orderedPluginsNames = [];
        this._logger = "function" === typeof options?.logger ? options.logger : null;
        // public
        this.plugins = [];
        this.directory = options?.directory ?? DEFAULT_PLUGINS_DIRECTORY;
        this.externalResourcesDirectory = options?.externalResourcesDirectory ?? DEFAULT_RESOURCES_DIRECTORY;
    }
    // public
    getPluginsNames() {
        return this.plugins.map((plugin) => {
            return plugin.name;
        });
    }
    // create a forced order to synchronously initialize plugins. not ordered plugins are asynchronously initialized after.
    setOrder(pluginsNames) {
        return (0, checkNonEmptyArray_1.default)("setOrder/pluginsNames", pluginsNames).then(() => {
            const errors = [];
            for (let i = 0; i < pluginsNames.length; ++i) {
                if ("string" !== typeof pluginsNames[i]) {
                    errors.push("The directory at index \"" + i + "\" must be a string");
                }
                else if ("" === pluginsNames[i].trim()) {
                    errors.push("The directory at index \"" + i + "\" must be not empty");
                }
                else if (1 < pluginsNames.filter((name) => {
                    return name === pluginsNames[i];
                }).length) {
                    errors.push("The directory at index \"" + i + "\" is given twice or more");
                }
            }
            return !errors.length ? Promise.resolve() : Promise.reject(new Error(errors.join("\r\n")));
        }).then(() => {
            this._orderedPluginsNames = pluginsNames;
        });
    }
    getOrder() {
        return [...this._orderedPluginsNames];
    }
    checkAllModules() {
        return Promise.all(this.plugins.map((plugin) => {
            return this.checkModules(plugin);
        })).then(() => {
            return Promise.resolve();
        });
    }
    checkModules(plugin) {
        return (0, checkAbsoluteDirectory_1.default)("checkModules/directory", this.directory).then(() => {
            return (0, checkOrchestrator_1.default)("checkModules/plugin", plugin);
        }).then(() => {
            return (0, check_version_modules_1.default)((0, node_path_1.join)(this.directory, plugin.name, "package.json"), {
                "failAtMajor": true,
                "failAtMinor": true,
                "failAtPatch": false,
                "dev": false
            }).then((analyze) => {
                return analyze.result ? Promise.resolve() : Promise.reject(new Error("\"" + plugin.name + "\" plugin has obsoletes modules"));
            });
        });
    }
    // used for execute all plugins' middlewares in app (express or other)
    appMiddleware(req, res, next) {
        // limit to plugins which has registered middleware
        const plugins = this.plugins.filter((plugin) => {
            return "function" === typeof plugin.appMiddleware;
        });
        if (0 >= plugins.length) {
            return next();
        }
        else {
            const _recursiveNext = (i) => {
                if (i < plugins.length) {
                    return () => {
                        return plugins[i].appMiddleware(req, res, _recursiveNext(i + 1));
                    };
                }
                // if no more plugin to try, pass the lead to the application
                else {
                    return next;
                }
            };
            return plugins[0].appMiddleware(req, res, _recursiveNext(1)); // must start at index "1", cause the "0" is executed here
        }
    }
    // middleware for socket to add bilateral push events
    socketMiddleware(server) {
        this.plugins.filter((plugin) => {
            return "function" === typeof plugin.socketMiddleware;
        }).forEach((plugin) => {
            plugin.socketMiddleware(server);
        });
    }
    // add a function executed before loading all plugins
    beforeLoadAll(callback) {
        return (0, checkFunction_1.default)("beforeLoadAll/callback", callback).then(() => {
            this._beforeLoadAll = callback;
        });
    }
    // load all plugins asynchronously, using "data" in arguments for "load" plugin's Orchestrator method
    loadAll(...data) {
        // create dir if not exist
        return (0, checkNonEmptyString_1.default)("initAll/directory", this.directory).then(() => {
            return (0, promises_1.mkdir)(this.directory, {
                "recursive": true
            }).then(() => {
                return (0, checkAbsoluteDirectory_1.default)("initAll/directory", this.directory);
            });
            // create dir if not exist
        }).then(() => {
            return (0, checkNonEmptyString_1.default)("initAll/externalResourcesDirectory", this.externalResourcesDirectory).then(() => {
                return (0, promises_1.mkdir)(this.externalResourcesDirectory, {
                    "recursive": true
                }).then(() => {
                    return (0, checkAbsoluteDirectory_1.default)("initAll/externalResourcesDirectory", this.externalResourcesDirectory);
                });
            });
            // ensure loop
        }).then(() => {
            return new Promise((resolve) => {
                setImmediate(resolve);
            });
            // execute _beforeLoadAll
        }).then(() => {
            return "function" !== typeof this._beforeLoadAll ? Promise.resolve() : new Promise((resolve, reject) => {
                const fn = this._beforeLoadAll(...data);
                if (!(fn instanceof Promise)) {
                    resolve();
                }
                else {
                    fn.then(resolve).catch(reject);
                }
            });
            // init plugins
        }).then(() => {
            return (0, promises_1.readdir)(this.directory);
            // load all
        }).then((files) => {
            return (0, loadSortedPlugins_1.default)(this.directory, this.externalResourcesDirectory, files, this.plugins, this._orderedPluginsNames, this.emit.bind(this), this._logger, ...data);
            // sort plugins
        }).then(() => {
            this.plugins.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
            // end
        }).then(() => {
            this.emit("allloaded", ...data);
        });
    }
    // after releasing, destroy packages data & free "plugins" list, using "data" in arguments for "destroy" plugin's Orchestrator method
    destroyAll(...data) {
        return Promise.all(this.plugins.map((plugin) => {
            return plugin.destroy().then(() => {
                this.emit("destroyed", plugin.name, ...data);
            });
        })).then(() => {
            this.plugins = [];
            this.emit("alldestroyed", ...data);
        });
    }
    // add a function executed before initializing all plugins
    beforeInitAll(callback) {
        return (0, checkFunction_1.default)("beforeInitAll/callback", callback).then(() => {
            this._beforeInitAll = callback;
        });
    }
    // initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method
    initAll(...data) {
        return (0, checkAbsoluteDirectory_1.default)("initAll/directory", this.directory).then(() => {
            return (0, checkAbsoluteDirectory_1.default)("initAll/externalResourcesDirectory", this.externalResourcesDirectory);
        }).then(() => {
            // execute _beforeInitAll
            return "function" !== typeof this._beforeInitAll ? Promise.resolve() : new Promise((resolve, reject) => {
                const fn = this._beforeInitAll(...data);
                if (!(fn instanceof Promise)) {
                    resolve();
                }
                else {
                    fn.then(resolve).catch(reject);
                }
            });
            // init plugins
        }).then(() => {
            return (0, initSortedPlugins_1.default)(this.plugins, this._orderedPluginsNames, this.emit.bind(this), ...data);
            // end
        }).then(() => {
            this.emit("allinitialized", ...data);
        });
    }
    // release a plugin (keep package but destroy Mediator & Server), using "data" in arguments for "release" plugin's Orchestrator method
    releaseAll(...data) {
        return Promise.all(this.plugins.map((plugin) => {
            return plugin.release(...data).then(() => {
                this.emit("released", plugin, ...data);
            });
        })).then(() => {
            this.emit("allreleased", ...data);
        });
    }
    // install a plugin via github repo, using "data" in arguments for "install" and "init" plugin's Orchestrator methods
    installViaGithub(user, repo, ...data) {
        return (0, checkAbsoluteDirectory_1.default)("installViaGithub/directory", this.directory).then(() => {
            return (0, checkNonEmptyString_1.default)("installViaGithub/user", user);
        }).then(() => {
            return (0, checkNonEmptyString_1.default)("installViaGithub/repo", repo);
        }).then(() => {
            const directory = (0, node_path_1.join)(this.directory, repo);
            return new Promise((resolve, reject) => {
                (0, checkAbsoluteDirectory_1.default)("installViaGithub/plugindirectory", directory).then(() => {
                    return reject(new Error("\"" + repo + "\" plugin already exists"));
                }).catch(() => {
                    return resolve(directory);
                });
            });
        }).then((directory) => {
            return (0, gitInstall_1.default)(directory, user, repo).then(() => {
                // install dependencies & execute install script
                return (0, createPluginByDirectory_1.default)(directory, this.externalResourcesDirectory, this._logger, ...data);
                // check plugin modules versions
            }).then((plugin) => {
                return this.checkModules(plugin).then(() => {
                    return Promise.resolve(plugin);
                });
            }).then((plugin) => {
                return Promise.resolve().then(() => {
                    return !plugin.dependencies ? Promise.resolve() : (0, npmInstall_1.default)(directory);
                }).then(() => {
                    return plugin.install(...data);
                    // execute init script
                }).then(() => {
                    this.emit("installed", plugin, ...data);
                    return plugin.init(...data);
                }).then(() => {
                    this.emit("initialized", plugin, ...data);
                    this.plugins.push(plugin);
                    return Promise.resolve(plugin);
                }).catch((err) => {
                    return this.uninstall(plugin, ...data).then(() => {
                        return Promise.reject(err);
                    });
                });
            }).catch((err) => {
                return (0, checkAbsoluteDirectory_1.default)("installViaGithub/plugindirectory", directory).then(() => {
                    return (0, rmdirp_1.default)(directory);
                }).then(() => {
                    return Promise.reject(err);
                }).catch(() => {
                    return Promise.reject(err);
                });
            });
        });
    }
    // update a plugin via its github repo, using "data" in arguments for "release", "update" and "init" plugin's methods
    updateViaGithub(plugin, ...data) {
        let directory = "";
        let key = -1;
        // check plugin
        return Promise.resolve().then(() => {
            return (0, checkOrchestrator_1.default)("updateViaGithub/plugin", plugin).then(() => {
                return (0, checkNonEmptyString_1.default)("updateViaGithub/github", (0, extractGithub_1.default)(plugin)).catch(() => {
                    return Promise.reject(new ReferenceError("Plugin \"" + plugin.name + "\" must be linked in the package to a github project to be updated"));
                });
            }).then(() => {
                key = this.getPluginsNames().findIndex((pluginName) => {
                    return pluginName === plugin.name;
                });
                return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));
            });
            // check plugin directory
        }).then(() => {
            return (0, checkAbsoluteDirectory_1.default)("updateViaGithub/directory", this.directory).then(() => {
                directory = (0, node_path_1.join)(this.directory, plugin.name);
                return (0, checkAbsoluteDirectory_1.default)("updateViaGithub/plugindirectory", directory);
            });
            // release plugin
        }).then(() => {
            const pluginName = plugin.name;
            return plugin.release(...data).then(() => {
                this.emit("released", plugin, ...data);
                return plugin.destroy();
            }).then(() => {
                this.emit("destroyed", pluginName, ...data);
                this.plugins.splice(key, 1);
            });
            // download plugin
        }).then(() => {
            return (0, gitUpdate_1.default)(directory).then(() => {
                return (0, createPluginByDirectory_1.default)(directory, this.externalResourcesDirectory, this._logger, ...data);
            });
            // check plugin modules versions
        }).then((_plugin) => {
            return this.checkModules(_plugin).then(() => {
                return Promise.resolve(_plugin);
            });
        }).then((_plugin) => {
            // update dependencies & execute update script
            return Promise.resolve().then(() => {
                return !_plugin.dependencies ? Promise.resolve() : (0, npmUpdate_1.default)(directory);
            }).then(() => {
                return _plugin.update(...data);
            }).then(() => {
                this.emit("updated", _plugin, ...data);
                return _plugin.init(...data);
                // execute init script
            }).then(() => {
                this.emit("initialized", _plugin, ...data);
                this.plugins[key] = _plugin;
                return Promise.resolve(_plugin);
            });
        });
    }
    // uninstall a plugin, using "data" in arguments for "release" and "uninstall" plugin's methods
    uninstall(plugin, ...data) {
        let directory = "";
        let key = -1;
        let pluginName = "";
        // check plugin
        return Promise.resolve().then(() => {
            return (0, checkOrchestrator_1.default)("uninstall/plugin", plugin).then(() => {
                key = this.getPluginsNames().findIndex((name) => {
                    return name === plugin.name;
                });
                return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));
            });
            // check plugin directory
        }).then(() => {
            return (0, checkAbsoluteDirectory_1.default)("uninstall/directory", this.directory).then(() => {
                pluginName = plugin.name;
                directory = (0, node_path_1.join)(this.directory, pluginName);
                return (0, checkAbsoluteDirectory_1.default)("uninstall/plugindirectory", directory);
            });
            // release plugin
        }).then(() => {
            return plugin.release(...data).then(() => {
                return (0, rmdirp_1.default)((0, node_path_1.join)(this.externalResourcesDirectory, pluginName));
            }).then(() => {
                this.emit("released", plugin, ...data);
                return plugin.destroy(...data);
            }).then(() => {
                this.emit("destroyed", pluginName, ...data);
                this.plugins.splice(key, 1);
            });
            // update dependencies & execute update script
        }).then(() => {
            return plugin.uninstall(...data).then(() => {
                this.emit("uninstalled", pluginName, ...data);
                return (0, rmdirp_1.default)(directory);
            });
        }).then(() => {
            return Promise.resolve(pluginName);
        });
    }
}
exports.default = PluginsManager;
