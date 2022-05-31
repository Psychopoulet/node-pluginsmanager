/*
	eslint-disable max-lines, prefer-destructuring, func-style
*/

"use strict";

// deps

	// natives
	const Events = require("events");
	const { join } = require("path");
	const { homedir } = require("os");

	// externals
	const versionModulesChecker = require("check-version-modules");
	const { mkdirp, readdir, remove } = require("fs-extra");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isNonEmptyArray = require(join(__dirname, "checkers", "isNonEmptyArray.js"));
	const isNonEmptyString = require(join(__dirname, "checkers", "isNonEmptyString.js"));
	const isOrchestrator = require(join(__dirname, "checkers", "isOrchestrator.js"));
	const createPluginByDirectory = require(join(__dirname, "createPluginByDirectory.js"));

		// git
		const gitInstall = require(join(__dirname, "cmd", "git", "install.js"));
		const gitUpdate = require(join(__dirname, "cmd", "git", "update.js"));

		// npm
		const npmInstall = require(join(__dirname, "cmd", "npm", "install.js"));
		const npmUpdate = require(join(__dirname, "cmd", "npm", "update.js"));

	const loadSortedPlugins = require(join(__dirname, "loadSortedPlugins.js"));
	const initSortedPlugins = require(join(__dirname, "initSortedPlugins.js"));

// consts

	const DEFAULT_PLUGINS_DIRECTORY = join(homedir(), "node-pluginsmanager-plugins");
	const DEFAULT_RESSOURCES_DIRECTORY = join(homedir(), "node-pluginsmanager-resources");

// module

module.exports = class PluginsManager extends Events {

	constructor (options) {

		super(options);

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

		// getters

			getPluginsNames () {

				return [ ...this.plugins ].map((plugin) => {
					return plugin.name;
				});

			}

		// setters

			setOrder (pluginsNames) {

				return isNonEmptyArray("setOrder/pluginsNames", pluginsNames).then(() => {

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

			getOrder () {

				return [ ...this._orderedPluginsNames ];

			}

		// checkers

			checkAllModules () {

				const _checkPluginsModules = (i = 0) => {

					return i < this.plugins.length ? this.checkModules(this.plugins[i]).then(() => {

						return _checkPluginsModules(i + 1);

					}) : Promise.resolve();

				};

				return _checkPluginsModules();

			}

			checkModules (plugin) {

				return isAbsoluteDirectory("checkModules/directory", this.directory).then(() => {

					return isOrchestrator("checkModules/plugin", plugin);

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

		// network

			appMiddleware (req, res, next) {

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

			socketMiddleware (server) {

				this.plugins.filter((plugin) => {
					return "function" === typeof plugin.socketMiddleware;
				}).forEach((plugin) => {
					plugin.socketMiddleware(server);
				});

			}

		// load / destroy

			beforeLoadAll (callback) {

				return isFunction("beforeLoadAll/callback", callback).then(() => {

					this._beforeLoadAll = callback;

					return Promise.resolve();

				});

			}

			loadAll (data) {

				// create dir if not exist
				return isNonEmptyString("initAll/directory", this.directory).then(() => {

					return mkdirp(this.directory).then(() => {
						return isAbsoluteDirectory("initAll/directory", this.directory);
					});

				// create dir if not exist
				}).then(() => {

					return isNonEmptyString("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory).then(() => {

						return mkdirp(this.externalRessourcesDirectory).then(() => {
							return isAbsoluteDirectory("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);
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

						const fn = this._beforeLoadAll(data);

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
						this._orderedPluginsNames, this.emit.bind(this), this._logger, data
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

					this.emit("allloaded", data);

					return Promise.resolve();

				});

			}

			destroyAll (data) {

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

		// init / release

			beforeInitAll (callback) {

				return isFunction("beforeInitAll/callback", callback).then(() => {

					this._beforeInitAll = callback;

					return Promise.resolve();

				});

			}

			initAll (data) {

				return isAbsoluteDirectory("initAll/directory", this.directory).then(() => {

					return isAbsoluteDirectory("initAll/externalRessourcesDirectory", this.externalRessourcesDirectory);

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

			releaseAll (data) {

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

		// write

			installViaGithub (user, repo, data) {

				return isAbsoluteDirectory("installViaGithub/directory", this.directory).then(() => {
					return isNonEmptyString("installViaGithub/user", user);
				}).then(() => {
					return isNonEmptyString("installViaGithub/repo", repo);
				}).then(() => {

					const directory = join(this.directory, repo);

					return new Promise((resolve, reject) => {

						isAbsoluteDirectory("installViaGithub/plugindirectory", directory).then(() => {
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

							isAbsoluteDirectory("installViaGithub/plugindirectory", directory).then(() => {

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

			updateViaGithub (plugin, data) {

				let directory = "";
				let key = -1;

				// check plugin
				return Promise.resolve().then(() => {

					return isOrchestrator("updateViaGithub/plugin", plugin).then(() => {

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

						return isNonEmptyString("updateViaGithub/github", github).catch(() => {

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

					return isAbsoluteDirectory("updateViaGithub/directory", this.directory).then(() => {

						directory = join(this.directory, plugin.name);

						return isAbsoluteDirectory("updateViaGithub/plugindirectory", directory);

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

			uninstall (plugin, data) {

				let directory = "";
				let key = -1;
				let pluginName = "";

				// check plugin
				return Promise.resolve().then(() => {

					return isOrchestrator("uninstall/plugin", plugin).then(() => {

						key = this.getPluginsNames().findIndex((name) => {
							return name === plugin.name;
						});

						return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

					});

				// check plugin directory
				}).then(() => {

					return isAbsoluteDirectory("uninstall/directory", this.directory).then(() => {

						pluginName = plugin.name;
						directory = join(this.directory, pluginName);

						return isAbsoluteDirectory("uninstall/plugindirectory", directory);

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
