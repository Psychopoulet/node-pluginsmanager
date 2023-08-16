"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// deps
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
const DEFAULT_RESSOURCES_DIRECTORY = (0, node_path_1.join)((0, node_os_1.homedir)(), "node-pluginsmanager-resources");
// module
class PluginsManager extends node_events_1.default {
    // constructor
    constructor(options) {
        super();
        // protected
        this._beforeLoadAll = null;
        this._beforeInitAll = null;
        this._orderedPluginsNames = [];
        this._logger = options && "function" === typeof options.logger ?
            options.logger : null;
        // public
        this.plugins = [];
        this.directory = options && "undefined" !== typeof options.directory ?
            options.directory : DEFAULT_PLUGINS_DIRECTORY;
        this.externalRessourcesDirectory = options && "undefined" !== typeof options.externalRessourcesDirectory ?
            options.externalRessourcesDirectory : DEFAULT_RESSOURCES_DIRECTORY;
    }
    // public
    getPluginsNames() {
        return [...this.plugins].map((plugin) => {
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
            return Promise.resolve();
        });
    }
    getOrder() {
        return [...this._orderedPluginsNames];
    }
    checkAllModules() {
        const _checkPluginsModules = (i = 0) => {
            return i < this.plugins.length ? this.checkModules(this.plugins[i]).then(() => {
                return _checkPluginsModules(i + 1);
            }) : Promise.resolve();
        };
        return _checkPluginsModules();
    }
    checkModules(plugin) {
        return (0, checkAbsoluteDirectory_1.default)("checkModules/directory", this.directory).then(() => {
            return (0, checkOrchestrator_1.default)("checkModules/plugin", plugin);
        }).then(() => {
            return (0, check_version_modules_1.default)((0, node_path_1.join)(this.directory, plugin.name, "package.json"), {
                "failAtMajor": true,
                "failAtMinor": true,
                "failAtPatch": false,
                "dev": false,
                "console": false
            }).then((valid) => {
                return valid ? Promise.resolve() : Promise.reject(new Error("\"" + plugin.name + "\" plugin has obsoletes modules"));
            });
        });
    }
    // used for execute all plugins' middlewares in app (express or other)
    appMiddleware(req, res, next) {
        const plugins = this.plugins.filter((plugin) => {
            return "function" === typeof plugin.appMiddleware;
        });
        if (!plugins.length) {
            return next();
        }
        else {
            const _recursiveNext = (i = 1) => {
                if (i >= plugins.length) {
                    return next;
                }
                else {
                    return () => {
                        return plugins[i].appMiddleware(req, res, _recursiveNext(i + 1));
                    };
                }
            };
            return plugins[0].appMiddleware(req, res, _recursiveNext());
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
            return Promise.resolve();
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
            return (0, checkNonEmptyString_1.default)("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory).then(() => {
                return (0, promises_1.mkdir)(this.externalRessourcesDirectory, {
                    "recursive": true
                }).then(() => {
                    return (0, checkAbsoluteDirectory_1.default)("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);
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
            return (0, loadSortedPlugins_1.default)(this.directory, this.externalRessourcesDirectory, files, this.plugins, this._orderedPluginsNames, this.emit.bind(this), this._logger, ...data);
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
            return Promise.resolve();
            // end
        }).then(() => {
            this.emit("allloaded", ...data);
            return Promise.resolve();
        });
    }
    // after releasing, destroy packages data & free "plugins" list, using "data" in arguments for "destroy" plugin's Orchestrator method
    destroyAll(...data) {
        return Promise.resolve().then(() => {
            const _destroyPlugin = (i = this.plugins.length - 1) => {
                return -1 < i ? Promise.resolve().then(() => {
                    const pluginName = this.plugins[i].name;
                    // emit event
                    return this.plugins[i].destroy().then(() => {
                        this.emit("destroyed", pluginName, ...data);
                        return Promise.resolve();
                        // loop
                    }).then(() => {
                        return _destroyPlugin(i - 1);
                    });
                }) : Promise.resolve();
            };
            return _destroyPlugin();
            // end
        }).then(() => {
            this.plugins = [];
            this.emit("alldestroyed", ...data);
            return Promise.resolve();
            // remove all external resources
        }).then(() => {
            return (0, rmdirp_1.default)(this.externalRessourcesDirectory);
        });
    }
    // add a function executed before initializing all plugins
    beforeInitAll(callback) {
        return (0, checkFunction_1.default)("beforeInitAll/callback", callback).then(() => {
            this._beforeInitAll = callback;
            return Promise.resolve();
        });
    }
    // initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method
    initAll(...data) {
        return (0, checkAbsoluteDirectory_1.default)("initAll/directory", this.directory).then(() => {
            return (0, checkAbsoluteDirectory_1.default)("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);
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
            return Promise.resolve();
        });
    }
    // release a plugin (keep package but destroy Mediator & Server), using "data" in arguments for "release" plugin's Orchestrator method
    releaseAll(...data) {
        return Promise.resolve().then(() => {
            const _releasePlugin = (i = this.plugins.length - 1) => {
                return -1 < i ? Promise.resolve().then(() => {
                    return this.plugins[i].release(data);
                    // emit event
                }).then(() => {
                    this.emit("released", this.plugins[i], ...data);
                    return Promise.resolve();
                    // loop
                }).then(() => {
                    return _releasePlugin(i - 1);
                }) : Promise.resolve();
            };
            return _releasePlugin();
            // end
        }).then(() => {
            this.emit("allreleased", ...data);
            return Promise.resolve();
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
            return Promise.resolve().then(() => {
                return (0, gitInstall_1.default)(directory, user, repo);
            }).then(() => {
                // install dependencies & execute install script
                return (0, createPluginByDirectory_1.default)(directory, this.externalRessourcesDirectory, this._logger, ...data);
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
                return new Promise((resolve, reject) => {
                    (0, checkAbsoluteDirectory_1.default)("installViaGithub/plugindirectory", directory).then(() => {
                        return (0, rmdirp_1.default)(directory).then(() => {
                            return err ? reject(err) : resolve();
                        });
                    }).catch(() => {
                        return err ? reject(err) : resolve();
                    });
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
                return Promise.resolve();
            });
            // download plugin
        }).then(() => {
            return (0, gitUpdate_1.default)(directory).then(() => {
                return (0, createPluginByDirectory_1.default)(directory, this.externalRessourcesDirectory, this._logger, ...data);
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
                return (0, rmdirp_1.default)((0, node_path_1.join)(this.externalRessourcesDirectory));
            }).then(() => {
                this.emit("released", plugin, ...data);
                return plugin.destroy(...data);
            }).then(() => {
                this.emit("destroyed", pluginName, ...data);
                this.plugins.splice(key, 1);
                return Promise.resolve();
            });
            // update dependencies & execute update script
        }).then(() => {
            return Promise.resolve().then(() => {
                return plugin.uninstall(...data);
            }).then(() => {
                this.emit("uninstalled", pluginName, ...data);
                return (0, rmdirp_1.default)(directory);
            });
        }).then(() => {
            return Promise.resolve(pluginName);
        });
    }
}
exports.default = PluginsManager;
;
