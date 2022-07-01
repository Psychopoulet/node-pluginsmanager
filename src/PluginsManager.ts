"use strict";

// deps

	// natives
	import EventEmitter from "events";
	import { join } from "path";
	import { homedir } from "os";

	// externals
	import versionModulesChecker from "check-version-modules";
	import { mkdirp, readdir, remove } from "fs-extra";

	// locals
	import checkAbsoluteDirectory from "./checkers/checkAbsoluteDirectory";
	import checkFunction from "./checkers/checkFunction";
	import checkNonEmptyArray from "./checkers/checkNonEmptyArray";
	import checkNonEmptyString from "./checkers/checkNonEmptyString";
	import checkOrchestrator from "./checkers/checkOrchestrator";
	import createPluginByDirectory from "./createPluginByDirectory";

	import loadSortedPlugins from "./loadSortedPlugins";
	import initSortedPlugins from "./initSortedPlugins";

		// git
		import gitInstall from "./cmd/git/gitInstall";
		import gitUpdate from "./cmd/git/gitUpdate";

		// npm
		import npmInstall from "./cmd/npm/npmInstall";
		import npmUpdate from "./cmd/npm/npmUpdate";

// types & interfaces

	import { Orchestrator, tLogger, iIncomingMessage, iServerResponse } from "node-pluginsmanager-plugin";
	import { Server as WebSocketServer } from "ws";
	import { Server as SocketIOServer } from "socket.io";

	interface iPluginManagerOptions {
		"directory"?: string;
		"externalRessourcesDirectory"?: string;
		"logger"?: tLogger | null;
	}

// consts

	const DEFAULT_PLUGINS_DIRECTORY: string = join(homedir(), "node-pluginsmanager-plugins");
	const DEFAULT_RESSOURCES_DIRECTORY: string = join(homedir(), "node-pluginsmanager-resources");

// module

export default class PluginsManager extends EventEmitter {

	// attributes

		// protected

		protected _beforeLoadAll: ((...data: any) => Promise<void>) | void | null;
		protected _beforeInitAll: ((...data: any) => Promise<void>) | void | null;

		protected _logger: tLogger | null;

		protected _orderedPluginsNames: Array<string>;

	// public

		public directory: string; // plugins location (must be writable). default : join(homedir(), "node-pluginsmanager-plugins")
		public externalRessourcesDirectory: string; // external resources locations (sqlite, files, cache, etc...) (must be writable). default : join(homedir(), "node-pluginsmanager-resources")
		public plugins: Array<Orchestrator>; // plugins' Orchestrators

	// constructor

	public constructor (options: iPluginManagerOptions) {

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

		public getPluginsNames (): Array<string> {

			return [ ...this.plugins ].map((plugin) => {
				return plugin.name;
			});

		}

		// create a forced order to synchronously initialize plugins. not ordered plugins are asynchronously initialized after.
		public setOrder (pluginsNames: Array<string>): Promise<void> {

			return checkNonEmptyArray("setOrder/pluginsNames", pluginsNames).then(() => {

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

		public getOrder (): Array<string> {

			return [ ...this._orderedPluginsNames ];

		}

		public checkAllModules (): Promise<void> {

			const _checkPluginsModules = (i = 0) => {

				return i < this.plugins.length ? this.checkModules(this.plugins[i]).then(() => {

					return _checkPluginsModules(i + 1);

				}) : Promise.resolve();

			};

			return _checkPluginsModules();

		}

		public checkModules (plugin: Orchestrator): Promise<void> {

			return checkAbsoluteDirectory("checkModules/directory", this.directory).then(() => {

				return checkOrchestrator("checkModules/plugin", plugin);

			}).then(() => {

				return versionModulesChecker(join(this.directory, plugin.name, "package.json"), {
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
		public appMiddleware (req: iIncomingMessage, res: iServerResponse, next: Function): void {

			const plugins = this.plugins.filter((plugin) => {
				return "function" === typeof plugin.appMiddleware;
			});

			if (!plugins.length) {
				return next();
			}
			else {

				const _recursiveNext = (i) => {

					if (i >= plugins.length) {
						return next;
					}
					else {

						return () => {
							return plugins[i].appMiddleware(req, res, _recursiveNext(i + 1));
						};

					}

				};

				return plugins[0].appMiddleware(req, res, _recursiveNext(1));

			}

		}

		// middleware for socket to add bilateral push events
		public socketMiddleware (server: WebSocketServer | SocketIOServer): void {

			this.plugins.filter((plugin) => {
				return "function" === typeof plugin.socketMiddleware;
			}).forEach((plugin) => {
				plugin.socketMiddleware(server);
			});

		}

		// add a function executed before loading all plugins
		public beforeLoadAll (callback: (...data: any) => Promise<void> | void): Promise<void> {

			return checkFunction("beforeLoadAll/callback", callback).then(() => {

				this._beforeLoadAll = callback;

				return Promise.resolve();

			});

		}

		// load all plugins asynchronously, using "data" in arguments for "load" plugin's Orchestrator method
		public loadAll (...data: any): Promise<void> {

			// create dir if not exist
			return checkNonEmptyString("initAll/directory", this.directory).then(() => {

				return mkdirp(this.directory).then(() => {
					return checkAbsoluteDirectory("initAll/directory", this.directory);
				});

			// create dir if not exist
			}).then(() => {

				return checkNonEmptyString("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory).then(() => {

					return mkdirp(this.externalRessourcesDirectory).then(() => {
						return checkAbsoluteDirectory("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);
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

				return readdir(this.directory);

			// load all
			}).then((files) => {

				return loadSortedPlugins(
					this.directory, this.externalRessourcesDirectory, files, this.plugins,
					this._orderedPluginsNames, this.emit.bind(this), this._logger, ...data
				);

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
		public destroyAll (...data: any): Promise<void> {

			return Promise.resolve().then(() => {

				const _destroyPlugin = (i = this.plugins.length - 1) => {

					return -1 < i ? Promise.resolve().then(() => {

						const pluginName = this.plugins[i].name;

						// emit event
						return this.plugins[i].destroy(data).then(() => {

							this.emit("destroyed", pluginName, data);

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

				this.emit("alldestroyed", data);

				return Promise.resolve();

			// remove all external resources
			}).then(() => {

				return remove(this.externalRessourcesDirectory);

			});

		}

		// add a function executed before initializing all plugins
		public beforeInitAll (callback: (...data: any) => Promise<void> | void): Promise<void> {

			return checkFunction("beforeInitAll/callback", callback).then(() => {

				this._beforeInitAll = callback;

				return Promise.resolve();

			});

		}

		// initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method
		public initAll (...data: any): Promise<void> {

			return checkAbsoluteDirectory("initAll/directory", this.directory).then(() => {

				return checkAbsoluteDirectory("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);

			}).then(() => {

				// execute _beforeInitAll
				return "function" !== typeof this._beforeInitAll ? Promise.resolve() : new Promise((resolve, reject) => {

					const fn = this._beforeInitAll(data);

					if (!(fn instanceof Promise)) {
						resolve();
					}
					else {
						fn.then(resolve).catch(reject);
					}

				});

			// init plugins
			}).then(() => {

				return initSortedPlugins(
					this.plugins, this._orderedPluginsNames, (...subdata) => {
						this.emit(...subdata);
					}, data
				);

			// end
			}).then(() => {

				this.emit("allinitialized", data);

				return Promise.resolve();

			});

		}

		// release a plugin (keep package but destroy Mediator & Server), using "data" in arguments for "release" plugin's Orchestrator method
		public releaseAll (...data: any): Promise<void> {

			return Promise.resolve().then(() => {

				const _releasePlugin = (i = this.plugins.length - 1) => {

					return -1 < i ? Promise.resolve().then(() => {

						return this.plugins[i].release(data);

					// emit event
					}).then(() => {

						this.emit("released", this.plugins[i], data);

						return Promise.resolve();

					// loop
					}).then(() => {

						return _releasePlugin(i - 1);

					}) : Promise.resolve();

				};

				return _releasePlugin();

			// end
			}).then(() => {

				this.emit("allreleased", data);

				return Promise.resolve();

			});

		}

		// install a plugin via github repo, using "data" in arguments for "install" and "init" plugin's Orchestrator methods
		public installViaGithub (user: string, repo: string, ...data: any): Promise<Orchestrator> {

			return checkAbsoluteDirectory("installViaGithub/directory", this.directory).then(() => {
				return checkNonEmptyString("installViaGithub/user", user);
			}).then(() => {
				return checkNonEmptyString("installViaGithub/repo", repo);
			}).then(() => {

				const directory = join(this.directory, repo);

				return new Promise((resolve, reject) => {

					checkAbsoluteDirectory("installViaGithub/plugindirectory", directory).then(() => {
						reject(new Error("\"" + repo + "\" plugin already exists"));
					}).catch(() => {
						resolve(directory);
					});

				});

			}).then((directory) => {

				return Promise.resolve().then(() => {

					return gitInstall(directory, user, repo);

				}).then(() => {

					// install dependencies & execute install script
					return createPluginByDirectory(directory, this.externalRessourcesDirectory, this._logger);

				// check plugin modules versions
				}).then((plugin) => {

					return this.checkModules(plugin).then(() => {
						return Promise.resolve(plugin);
					});

				}).then((plugin) => {

					return Promise.resolve().then(() => {

						return !plugin.dependencies ? Promise.resolve() : npmInstall(directory);

					}).then(() => {

						return plugin.install(data);

					// execute init script
					}).then(() => {

						this.emit("installed", plugin, data);

						return plugin.init(data);

					}).then(() => {

						this.emit("initialized", plugin, data);
						this.plugins.push(plugin);

						return Promise.resolve(plugin);

					}).catch((err) => {

						return this.uninstall(plugin, data).then(() => {
							return Promise.reject(err);
						});

					});

				}).catch((err) => {

					return new Promise((resolve, reject) => {

						checkAbsoluteDirectory("installViaGithub/plugindirectory", directory).then(() => {

							return remove(directory).then(() => {
								reject(err);
							});

						}).catch(() => {
							reject(err);
						});

					});

				});

			});

		}

		// update a plugin via its github repo, using "data" in arguments for "release", "update" and "init" plugin's methods
		public updateViaGithub (plugin: Orchestrator, ...data: any): Promise<Orchestrator> {

			let directory = "";
			let key = -1;

			// check plugin
			return Promise.resolve().then(() => {

				return checkOrchestrator("updateViaGithub/plugin", plugin).then(() => {

					let github = "";
					if ("string" === typeof plugin.github) {
						github = plugin.github;
					}
					else if ("string" === typeof plugin.repository) {
						github = plugin.repository;
					}
					else if (plugin.repository && "string" === typeof plugin.repository.url) {
						github = plugin.repository.url;
					}

					return checkNonEmptyString("updateViaGithub/github", github).catch(() => {

						return Promise.reject(new ReferenceError(
							"Plugin \"" + plugin.name + "\" must be linked in the package to a github project to be updated"
						));

					});

				}).then(() => {

					key = this.getPluginsNames().findIndex((pluginName) => {
						return pluginName === plugin.name;
					});

					return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

				});

			// check plugin directory
			}).then(() => {

				return checkAbsoluteDirectory("updateViaGithub/directory", this.directory).then(() => {

					directory = join(this.directory, plugin.name);

					return checkAbsoluteDirectory("updateViaGithub/plugindirectory", directory);

				});

			// release plugin
			}).then(() => {

				const pluginName = plugin.name;

				return plugin.release(data).then(() => {

					this.emit("released", plugin, data);

					return plugin.destroy(data);

				}).then(() => {

					this.emit("destroyed", pluginName, data);

					this.plugins[key] = null;

					return Promise.resolve();

				});

			// download plugin
			}).then(() => {

				return gitUpdate(directory).then(() => {

					return createPluginByDirectory(directory, this.externalRessourcesDirectory, this._logger);

				});

			// check plugin modules versions
			}).then((_plugin) => {

				return this.checkModules(_plugin).then(() => {
					return Promise.resolve(_plugin);
				});

			}).then((_plugin) => {

				// update dependencies & execute update script
				return Promise.resolve().then(() => {

					return !_plugin.dependencies ? Promise.resolve() : npmUpdate(directory);

				}).then(() => {

					return _plugin.update(data);

				}).then(() => {

					this.emit("updated", _plugin, data);

					return _plugin.init(data);

				// execute init script
				}).then(() => {

					this.emit("initialized", _plugin, data);
					this.plugins[key] = _plugin;

					return Promise.resolve(_plugin);

				});

			});

		}

		// uninstall a plugin, using "data" in arguments for "release" and "uninstall" plugin's methods
		public uninstall(plugin: Orchestrator, ...data: any): Promise<string> {

			let directory = "";
			let key = -1;
			let pluginName = "";

			// check plugin
			return Promise.resolve().then(() => {

				return checkOrchestrator("uninstall/plugin", plugin).then(() => {

					key = this.getPluginsNames().findIndex((name) => {
						return name === plugin.name;
					});

					return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

				});

			// check plugin directory
			}).then(() => {

				return checkAbsoluteDirectory("uninstall/directory", this.directory).then(() => {

					pluginName = plugin.name;
					directory = join(this.directory, pluginName);

					return checkAbsoluteDirectory("uninstall/plugindirectory", directory);

				});

			// release plugin
			}).then(() => {

				return plugin.release(data).then(() => {

					return remove(join(this.externalRessourcesDirectory, pluginName));

				}).then(() => {

					this.emit("released", plugin, data);

					return plugin.destroy(data);

				}).then(() => {

					this.emit("destroyed", pluginName, data);

					this.plugins.splice(key, 1);

					return Promise.resolve();

				});

			// update dependencies & execute update script
			}).then(() => {

				return Promise.resolve().then(() => {

					return plugin.uninstall(data);

				}).then(() => {

					this.emit("uninstalled", pluginName, data);

					return remove(directory);

				});

			}).then(() => {

				return Promise.resolve(pluginName);

			});

		}

};
