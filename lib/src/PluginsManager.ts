// deps

    // natives
    import EventEmitter from "node:events";
    import { join } from "node:path";
    import { homedir } from "node:os";
    import { mkdir, readdir } from "node:fs/promises";

    // externals
    import versionModulesChecker from "check-version-modules";

    // locals
    import rmdirp from "./utils/rmdirp";
    import checkAbsoluteDirectory from "./checkers/checkAbsoluteDirectory";
    import checkFunction from "./checkers/checkFunction";
    import checkNonEmptyArray from "./checkers/checkNonEmptyArray";
    import checkNonEmptyString from "./checkers/checkNonEmptyString";
    import checkOrchestrator from "./checkers/checkOrchestrator";
    import createPluginByDirectory from "./createPluginByDirectory";

    import loadSortedPlugins from "./loadSortedPlugins";
    import initSortedPlugins from "./initSortedPlugins";

    import extractGithub from "./extractGithub";

        // git
        import gitInstall from "./cmd/git/gitInstall";
        import gitUpdate from "./cmd/git/gitUpdate";

        // npm
        import npmInstall from "./cmd/npm/npmInstall";
        import npmUpdate from "./cmd/npm/npmUpdate";

// types & interfaces

    // natives
    import type { IncomingMessage, ServerResponse } from "node:http";

    // externals
    import type { Orchestrator, tLogger, iServerResponse } from "node-pluginsmanager-plugin";
    import type { Server as WebSocketServer } from "ws";
    import type { Server as SocketIOServer } from "socket.io";

    interface iPluginManagerOptions {
        "directory"?: string;
        "externalResourcesDirectory"?: string;
        "logger"?: tLogger | null;
    }

    type tBeforeAllMethodCallback = (...data: unknown[]) => Promise<void> | void;

// consts

    const DEFAULT_PLUGINS_DIRECTORY: string = join(homedir(), "node-pluginsmanager-plugins");
    const DEFAULT_RESOURCES_DIRECTORY: string = join(homedir(), "node-pluginsmanager-resources");

// module

export default class PluginsManager extends EventEmitter {

    // attributes

        // protected

        protected _beforeLoadAll: tBeforeAllMethodCallback | null;
        protected _beforeInitAll: tBeforeAllMethodCallback | null;

        protected _logger: tLogger | null;

        protected _orderedPluginsNames: string[];

    // public

        public directory: string; // plugins location (must be writable). default : join(homedir(), "node-pluginsmanager-plugins")
        public externalResourcesDirectory: string; // external resources locations (sqlite, files, cache, etc...) (must be writable). default : join(homedir(), "node-pluginsmanager-resources")
        public plugins: Orchestrator[]; // plugins' Orchestrators

    // constructor

    public constructor (options: iPluginManagerOptions) {

        super();

        // protected

            this._beforeLoadAll = null;
            this._beforeInitAll = null;

            this._orderedPluginsNames = [];

            this._logger = options && "function" === typeof options.logger
                ? options.logger
                : null;

        // public

            this.plugins = [];

            this.directory = options && "undefined" !== typeof options.directory
                ? options.directory
                : DEFAULT_PLUGINS_DIRECTORY;

            this.externalResourcesDirectory = options && "undefined" !== typeof options.externalResourcesDirectory
                ? options.externalResourcesDirectory
                : DEFAULT_RESOURCES_DIRECTORY;

    }

    // public

        public getPluginsNames (): string[] {

            return this.plugins.map((plugin: Orchestrator): string => {
                return plugin.name;
            });

        }

        // create a forced order to synchronously initialize plugins. not ordered plugins are asynchronously initialized after.
        public setOrder (pluginsNames: string[]): Promise<void> {

            return checkNonEmptyArray("setOrder/pluginsNames", pluginsNames).then((): Promise<void> => {

                const errors: string[] = [];
                for (let i: number = 0; i < pluginsNames.length; ++i) {

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

            }).then((): void => {

                this._orderedPluginsNames = pluginsNames;

            });

        }

        public getOrder (): string[] {

            return [ ...this._orderedPluginsNames ];

        }

        public checkAllModules (): Promise<void> {

            return Promise.all(this.plugins.map((plugin: Orchestrator): Promise<void> => {
                return this.checkModules(plugin);
            })).then((): Promise<void> => {
                return Promise.resolve();
            });

        }

        public checkModules (plugin: Orchestrator): Promise<void> {

            return checkAbsoluteDirectory("checkModules/directory", this.directory).then((): Promise<void> => {
                return checkOrchestrator("checkModules/plugin", plugin);
            }).then((): Promise<void> => {

                return versionModulesChecker(join(this.directory, plugin.name, "package.json"), {
                    "failAtMajor": true,
                    "failAtMinor": true,
                    "failAtPatch": false,
                    "dev": false
                }).then((analyze: {
					"result": boolean;
				}): Promise<void> => {

                    return analyze.result ? Promise.resolve() : Promise.reject(new Error("\"" + plugin.name + "\" plugin has obsoletes modules"));

                });

            });

        }

        // used for execute all plugins' middlewares in app (express or other)
        public appMiddleware (req: IncomingMessage, res: ServerResponse, next: () => void): void {

            // limit to plugins which has registered middleware
            const plugins: Orchestrator[] = this.plugins.filter((plugin: Orchestrator): boolean => {
                return "function" === typeof plugin.appMiddleware;
            });

            if (0 >= plugins.length) {
                return next();
            }
            else {

                const _recursiveNext: (i: number) => () => void = (i: number): (err?: unknown) => void => {

                    if (i < plugins.length) {

                        return (): void => {
                            return plugins[i].appMiddleware(req, res as iServerResponse, _recursiveNext(i + 1));
                        };

                    }

                    // if no more plugin to try, pass the lead to the application
                    else {
                        return next;
                    }

                };

                return plugins[0].appMiddleware(req, res as iServerResponse, _recursiveNext(1)); // must start at index "1", cause the "0" is executed here

            }

        }

        // middleware for socket to add bilateral push events
        public socketMiddleware (server: WebSocketServer | SocketIOServer): void {

            this.plugins.filter((plugin: Orchestrator): boolean => {
                return "function" === typeof plugin.socketMiddleware;
            }).forEach((plugin: Orchestrator): void => {
                plugin.socketMiddleware(server);
            });

        }

        // add a function executed before loading all plugins
        public beforeLoadAll (callback: tBeforeAllMethodCallback): Promise<void> {

            return checkFunction("beforeLoadAll/callback", callback).then((): void => {

                this._beforeLoadAll = callback;

            });

        }

        // load all plugins asynchronously, using "data" in arguments for "load" plugin's Orchestrator method
        public loadAll (...data: unknown[]): Promise<void> {

            // create dir if not exist
            return checkNonEmptyString("initAll/directory", this.directory).then((): Promise<void> => {

                return mkdir(this.directory, {
                    "recursive": true
                }).then((): Promise<void> => {
                    return checkAbsoluteDirectory("initAll/directory", this.directory);
                });

            // create dir if not exist
            }).then((): Promise<void> => {

                return checkNonEmptyString("initAll/externalResourcesDirectory", this.externalResourcesDirectory).then((): Promise<void> => {

                    return mkdir(this.externalResourcesDirectory, {
                        "recursive": true
                    }).then((): Promise<void> => {
                        return checkAbsoluteDirectory("initAll/externalResourcesDirectory", this.externalResourcesDirectory);
                    });

                });

            // ensure loop
            }).then((): Promise<void> => {

                return new Promise((resolve: () => void): void => {
                    setImmediate(resolve);
                });

            // execute _beforeLoadAll
            }).then((): Promise<void> => {

                return "function" !== typeof this._beforeLoadAll ? Promise.resolve() : new Promise((resolve: () => void, reject: (err: Error) => void): void => {

                    const fn: void | Promise<void> = (this._beforeLoadAll as tBeforeAllMethodCallback)(...data);

                    if (!(fn instanceof Promise)) {
                        resolve();
                    }
                    else {
                        fn.then(resolve).catch(reject);
                    }

                });

            // init plugins
            }).then((): Promise<string[]> => {

                return readdir(this.directory);

            // load all
            }).then((files: string[]): Promise<void> => {

                return loadSortedPlugins(
                    this.directory, this.externalResourcesDirectory, files, this.plugins,
                    this._orderedPluginsNames, this.emit.bind(this), this._logger, ...data
                );

            // sort plugins
            }).then((): void => {

                this.plugins.sort((a: Orchestrator, b: Orchestrator): -1 | 0 | 1 => {

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
            }).then((): void => {

                this.emit("allloaded", ...data);

            });

        }

        // after releasing, destroy packages data & free "plugins" list, using "data" in arguments for "destroy" plugin's Orchestrator method
        public destroyAll (...data: unknown[]): Promise<void> {

            return Promise.all(this.plugins.map((plugin: Orchestrator): Promise<void> => {

                return plugin.destroy().then((): void => {
                    this.emit("destroyed", plugin.name, ...data);
                });

            })).then((): void => {

                this.plugins = [];
                this.emit("alldestroyed", ...data);

            });

        }

        // add a function executed before initializing all plugins
        public beforeInitAll (callback: tBeforeAllMethodCallback): Promise<void> {

            return checkFunction("beforeInitAll/callback", callback).then((): void => {

                this._beforeInitAll = callback;

            });

        }

        // initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method
        public initAll (...data: unknown[]): Promise<void> {

            return checkAbsoluteDirectory("initAll/directory", this.directory).then((): Promise<void> => {
                return checkAbsoluteDirectory("initAll/externalResourcesDirectory", this.externalResourcesDirectory);
            }).then((): Promise<void> => {

                // execute _beforeInitAll
                return "function" !== typeof this._beforeInitAll ? Promise.resolve() : new Promise((resolve: () => void, reject: (err: Error) => void): void => {

                    const fn: void | Promise<void> = (this._beforeInitAll as tBeforeAllMethodCallback)(...data);

                    if (!(fn instanceof Promise)) {
                        resolve();
                    }
                    else {
                        fn.then(resolve).catch(reject);
                    }

                });

            // init plugins
            }).then((): Promise<void> => {

                return initSortedPlugins(this.plugins, this._orderedPluginsNames, this.emit.bind(this), ...data);

            // end
            }).then((): void => {

                this.emit("allinitialized", ...data);

            });

        }

        // release a plugin (keep package but destroy Mediator & Server), using "data" in arguments for "release" plugin's Orchestrator method
        public releaseAll (...data: unknown[]): Promise<void> {

            return Promise.all(this.plugins.map((plugin: Orchestrator): Promise<void> => {

                return plugin.release(...data).then((): void => {
                    this.emit("released", plugin, ...data);
                });

            })).then((): void => {

                this.emit("allreleased", ...data);

            });

        }

        // install a plugin via github repo, using "data" in arguments for "install" and "init" plugin's Orchestrator methods
        public installViaGithub (user: string, repo: string, ...data: unknown[]): Promise<Orchestrator> {

            return checkAbsoluteDirectory("installViaGithub/directory", this.directory).then((): Promise<void> => {
                return checkNonEmptyString("installViaGithub/user", user);
            }).then((): Promise<void> => {
                return checkNonEmptyString("installViaGithub/repo", repo);
            }).then((): Promise<string> => {

                const directory: string = join(this.directory, repo);

                return new Promise((resolve: (dir: string) => void, reject: (err: Error) => void): void => {

                    checkAbsoluteDirectory("installViaGithub/plugindirectory", directory).then((): void => {
                        return reject(new Error("\"" + repo + "\" plugin already exists"));
                    }).catch((): void => {
                        return resolve(directory);
                    });

                });

            }).then((directory: string): Promise<Orchestrator> => {

                return gitInstall(directory, user, repo).then((): Promise<Orchestrator> => {

                    // install dependencies & execute install script
                    return createPluginByDirectory(directory, this.externalResourcesDirectory, this._logger, ...data);

                // check plugin modules versions
                }).then((plugin: Orchestrator): Promise<Orchestrator> => {

                    return this.checkModules(plugin).then((): Promise<Orchestrator> => {
                        return Promise.resolve(plugin);
                    });

                }).then((plugin: Orchestrator): Promise<Orchestrator> => {

                    return Promise.resolve().then((): Promise<void> => {

                        return !plugin.dependencies ? Promise.resolve() : npmInstall(directory);

                    }).then((): Promise<void> => {

                        return plugin.install(...data);

                    // execute init script
                    }).then((): Promise<void> => {

                        this.emit("installed", plugin, ...data);

                        return plugin.init(...data);

                    }).then((): Promise<Orchestrator> => {

                        this.emit("initialized", plugin, ...data);
                        this.plugins.push(plugin);

                        return Promise.resolve(plugin);

                    }).catch((err: Error) => {

                        return this.uninstall(plugin, ...data).then(() => {
                            return Promise.reject(err);
                        });

                    });

                }).catch((err: Error) => {

                    return checkAbsoluteDirectory("installViaGithub/plugindirectory", directory).then((): Promise<void> => {
                        return rmdirp(directory);
                    }).then(() => { // if delete succeed, still reject with the original error
                        return Promise.reject(err);
                    }).catch(() => { // whatever happened, reject with the original error
                        return Promise.reject(err);
                    });

                });

            });

        }

        // update a plugin via its github repo, using "data" in arguments for "release", "update" and "init" plugin's methods
        public updateViaGithub (plugin: Orchestrator, ...data: unknown[]): Promise<Orchestrator> {

            let directory: string = "";
            let key: number = -1;

            // check plugin
            return Promise.resolve().then((): Promise<void> => {

                return checkOrchestrator("updateViaGithub/plugin", plugin).then((): Promise<void> => {

                    return checkNonEmptyString("updateViaGithub/github", extractGithub(plugin)).catch(() => {

                        return Promise.reject(new ReferenceError(
                            "Plugin \"" + plugin.name + "\" must be linked in the package to a github project to be updated"
                        ));

                    });

                }).then((): Promise<void> => {

                    key = this.getPluginsNames().findIndex((pluginName: string): boolean => {
                        return pluginName === plugin.name;
                    });

                    return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

                });

            // check plugin directory
            }).then((): Promise<void> => {

                return checkAbsoluteDirectory("updateViaGithub/directory", this.directory).then((): Promise<void> => {

                    directory = join(this.directory, plugin.name);

                    return checkAbsoluteDirectory("updateViaGithub/plugindirectory", directory);

                });

            // release plugin
            }).then((): Promise<void> => {

                const pluginName: string = plugin.name;

                return plugin.release(...data).then((): Promise<void> => {

                    this.emit("released", plugin, ...data);

                    return plugin.destroy();

                }).then((): void => {

                    this.emit("destroyed", pluginName, ...data);

                    this.plugins.splice(key, 1);

                });

            // download plugin
            }).then((): Promise<Orchestrator> => {

                return gitUpdate(directory).then((): Promise<Orchestrator> => {

                    return createPluginByDirectory(directory, this.externalResourcesDirectory, this._logger, ...data);

                });

            // check plugin modules versions
            }).then((_plugin: Orchestrator): Promise<Orchestrator> => {

                return this.checkModules(_plugin).then((): Promise<Orchestrator> => {
                    return Promise.resolve(_plugin);
                });

            }).then((_plugin: Orchestrator): Promise<Orchestrator> => {

                // update dependencies & execute update script
                return Promise.resolve().then((): Promise<void> => {

                    return !_plugin.dependencies ? Promise.resolve() : npmUpdate(directory);

                }).then((): Promise<void> => {

                    return _plugin.update(...data);

                }).then((): Promise<void> => {

                    this.emit("updated", _plugin, ...data);

                    return _plugin.init(...data);

                // execute init script
                }).then((): Promise<Orchestrator> => {

                    this.emit("initialized", _plugin, ...data);
                    this.plugins[key] = _plugin;

                    return Promise.resolve(_plugin);

                });

            });

        }

        // uninstall a plugin, using "data" in arguments for "release" and "uninstall" plugin's methods
        public uninstall(plugin: Orchestrator, ...data: unknown[]): Promise<string> {

            let directory: string = "";
            let key: number = -1;
            let pluginName: string = "";

            // check plugin
            return Promise.resolve().then((): Promise<void> => {

                return checkOrchestrator("uninstall/plugin", plugin).then((): Promise<void> => {

                    key = this.getPluginsNames().findIndex((name: string): boolean => {
                        return name === plugin.name;
                    });

                    return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

                });

            // check plugin directory
            }).then((): Promise<void> => {

                return checkAbsoluteDirectory("uninstall/directory", this.directory).then((): Promise<void> => {

                    pluginName = plugin.name;
                    directory = join(this.directory, pluginName);

                    return checkAbsoluteDirectory("uninstall/plugindirectory", directory);

                });

            // release plugin
            }).then((): Promise<void> => {

                return plugin.release(...data).then((): Promise<void> => {

                    return rmdirp(join(this.externalResourcesDirectory, pluginName));

                }).then((): Promise<void> => {

                    this.emit("released", plugin, ...data);

                    return plugin.destroy(...data);

                }).then((): void => {

                    this.emit("destroyed", pluginName, ...data);

                    this.plugins.splice(key, 1);

                });

            // update dependencies & execute update script
            }).then((): Promise<void> => {

                return plugin.uninstall(...data).then((): Promise<void> => {

                    this.emit("uninstalled", pluginName, ...data);

                    return rmdirp(directory);

                });

            }).then((): Promise<string> => {

                return Promise.resolve(pluginName);

            });

        }

};
