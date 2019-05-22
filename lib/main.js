/*
	eslint array-element-newline: 0, max-lines: 0
*/

"use strict";

// deps

	// natives
	const path = require("path");

	// externals
	const Plugin = require("node-pluginsmanager-plugin");
	const {
		isDirectoryProm, isFileProm, mkdirpProm, readdirProm, rmdirpProm, unlinkProm
	} = require("node-promfs");

	// locals
	const createPluginByDirectory = require(path.join(__dirname, "createPluginByDirectory.js"));

	const CMD_DIRECTORY = path.join(__dirname, "cmd");

		const stdToString = require(path.join(CMD_DIRECTORY, "stdToString.js"));

		// git
		const gitInstall = require(path.join(CMD_DIRECTORY, "git", "install.js"));
		const gitUpdate = require(path.join(CMD_DIRECTORY, "git", "update.js"));

		// npm
		const npmInstall = require(path.join(CMD_DIRECTORY, "npm", "install.js"));
		const npmUpdate = require(path.join(CMD_DIRECTORY, "npm", "update.js"));

// module

module.exports = class PluginsManager extends require("events") {

	constructor (directory) {

		super();

		// protected

			this._beforeLoadAll = null;
			this._orderedDirectoriesBaseNames = [];
			this._maxListeners = 0;

		// public

			this.directory = directory && "string" === typeof directory ? directory : path.join(__dirname, "plugins");
			this.plugins = [];

	}

	// private

		/**
		* Return the plugin's key by its directory
		* @param {string} directory : plugin's directory
		* @returns {number} key
		*/
		_directoryToKey (directory) {

			let result = -1;

				for (let i = 0; i < this.plugins.length; ++i) {

					if (this.plugins[i].directory === directory) {
						result = i; break;
					}

				}

			return result;

		}

		/**
		* Enforce generic actions on error
		* @param {string} fnName : function name
		* @param {Error} err : error's message
		* @returns {Promise} Promised error
		*/
		_error (fnName, err) {

			this.emit("error", new Error(fnName + " : " + stdToString(err)));
			return Promise.reject(err);

		}

		/**
		* Use for but ordered loading
		* @param {number} i : plugin's key
		* @param {any} data : passed to plugin's "load" method
		* @returns {Promise} Operation's result
		*/
		_loadOrderedNext (i, data) {

			return i >= this._orderedDirectoriesBaseNames.length ?
				Promise.resolve() :
				this.loadByDirectory(path.join(this.directory, this._orderedDirectoriesBaseNames[i]), data).then(() => {
					return this._loadOrderedNext(i + 1, data);
				});

		}

		/**
		* Use for unloading
		* @param {object|Array|null} data : passed to plugin's "load" method
		* @returns {Promise} Operation's result
		*/
		_unloadNext (data) {

			return 0 >= this.plugins.length ?
				Promise.resolve() :
				this.unloadByKey(this.plugins.length - 1, data);

		}

	// public

		// getters

			static get plugin () {
				return Plugin;
			}

			getPluginsNames () {

				const result = [];

					this.plugins.forEach((plugin) => {
						result.push(plugin.name);
					});

				return result;

			}

		// setters

			setOrder (pluginsDirectoriesBaseNames) {

				return Promise.resolve().then(() => {

					return "object" !== typeof pluginsDirectoriesBaseNames || !(pluginsDirectoriesBaseNames instanceof Array) ?
						Promise.reject(new Error("This is not an array")) :
						Promise.resolve();

				}).then(() => {

					const errors = [];
					for (let i = 0; i < pluginsDirectoriesBaseNames.length; ++i) {

						if ("string" !== typeof pluginsDirectoriesBaseNames[i]) {
							errors.push("The directory at index \"" + i + "\" must be a string");
						}
						else if ("" === pluginsDirectoriesBaseNames[i].trim()) {
							errors.push("The directory at index \"" + i + "\" must be not empty");
						}

					}

					return !errors.length ? Promise.resolve() : Promise.reject(new Error(errors.join("\r\n")));

				}).then(() => {
					this._orderedDirectoriesBaseNames = pluginsDirectoriesBaseNames;
					return Promise.resolve();
				});

			}

		// inherited

			emit (eventName, eventData) {

				return 0 < this.listenerCount(eventName) ?
					super.emit(eventName, eventData ? eventData : null) :
					this;

			}

		// load / unload

			beforeLoadAll (callback) {

				return Promise.resolve().then(() => {

					return "function" !== typeof callback ?
						Promise.reject(new Error("This is not a function")) :
						Promise.resolve();

				}).then(() => {
					this._beforeLoadAll = callback;
					return Promise.resolve();
				});

			}

			// load

			loadByDirectory (directory, data) {

				return Promise.resolve().then(() => {

					return "string" !== typeof directory ?
						Promise.reject(new Error("\"directory\" parameter is not a string")) :
						Promise.resolve();

				}).then(() => {

					// is already loaded ?
					let plugin = null;
					for (let i = 0; i < this.plugins.length; ++i) {

						if (directory === this.plugins[i].directory) {
							plugin = this.plugins[i];
							break;
						}

					}

					// is already exists ?
					return plugin ?
						Promise.resolve(plugin) :
						isDirectoryProm(directory).then((exists) => {

						return !exists ?
							Promise.resolve() :
							createPluginByDirectory(directory).then((_plugin) => {

							// load

							plugin = _plugin;
							return plugin.load(data);

						}).then(() => {

							this.emit("loaded", plugin);
							this.plugins.push(plugin);

							return Promise.resolve(plugin);

						}).catch((err) => {

							return Promise.reject(
								new Error("\"" + (plugin ? plugin.name : path.basename(directory)) + "\" => " + (err.message ? err.message : err))
							).catch((_err) => {
								return this._error("loadByDirectory", _err);
							});

						});

					});

				});

			}

			loadAll (data) {

				return Promise.resolve().then(() => {

					return "" === this.directory ?
						Promise.reject(new Error("\"directory\" is not defined")) :
						Promise.resolve();

				}).then(() => {

					// create dir if not exist
					return mkdirpProm(this.directory).then(() => {

						// execute _beforeLoadAll
						return "function" !== typeof this._beforeLoadAll ? Promise.resolve() : new Promise((resolve, reject) => {

							const fn = this._beforeLoadAll();

							if (!(fn instanceof Promise)) {
								reject(new Error("\"beforeLoadAll\" callback's return is not a Promise instance"));
							}
							else {
								fn.then(resolve).catch(reject);
							}

						});

					// load plugins
					}).then(() => {
						return readdirProm(this.directory);
					}).then((files) => {

						if (0 >= files.length) {
							this.emit("allloaded");
							return Promise.resolve();
						}
						else {

							return this._loadOrderedNext(0, data).then(() => {

								return new Promise((resolve) => {

									let i = files.length;
									files.forEach((file) => {

										this.loadByDirectory(path.join(this.directory, file), data).then(() => {

											i--;
											if (0 === i) {
												this.emit("allloaded"); resolve();
											}

										}).catch(() => {

											i--;
											if (0 === i) {
												this.emit("allloaded"); resolve();
											}

										});

									});

								});

							});

						}

					// sort plugins
					}).then(() => {

						for (let i = 0; i < this.plugins.length - 1; ++i) {

							for (let j = i + 1; j < this.plugins.length; ++j) {

								if (this.plugins[i].name > this.plugins[j].name) {

									const tmp = this.plugins[j];

									this.plugins[j] = this.plugins[i];
									this.plugins[i] = tmp;

								}

							}

						}

						return Promise.resolve();

					}).catch((err) => {
						return this._error("loadAll", err);
					});

				});

			}

			// unload

			unloadByKey (key, data) {

				return Promise.resolve().then(() => {

					return "number" !== typeof key ?
						Promise.reject(new Error("\"key\" is not an integer")) :
						Promise.resolve();

				}).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					return this.plugins[key].unload(data).then(() => {

						this.emit("unloaded", this.plugins[key]);
						this.plugins.splice(key, 1);

						return Promise.resolve();

					}).catch((err) => {
						return this._error("unloadByKey", err);
					});

				});

			}

				unloadByDirectory (directory, data) {

					return isDirectoryProm(directory).then((exists) => {

						return !exists ?
							Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) :
							Promise.resolve();

					}).then(() => {

						const key = this._directoryToKey(directory);

						return -1 < key ?
							this.unloadByKey(key, data) :
							Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));

					});

				}

					unload (plugin, data) {

						return plugin && plugin.directory ?
							this.unloadByDirectory(plugin.directory, data) :
							Promise.reject(new Error("There is no plugin"));

					}

			unloadAll (data) {

				return this._unloadNext(data).then(() => {
					this.emit("allunloaded");
					return Promise.resolve();
				});

			}

		// write

			// add

			installViaGithub (user, repo, data) {

				const directory = path.join(this.directory, repo);

				return gitInstall(directory, user, repo).then(() => {

					// install dependencies & execute install script
					return createPluginByDirectory(directory);

				}).then((plugin) => {

					return Promise.resolve().then(() => {
						return !plugin.dependencies ? Promise.resolve() : npmInstall(directory);
					}).then(() => {
						return plugin.install(data);

					// execute load script
					}).then(() => {

						this.emit("installed", plugin);
						return plugin.load(data);

					}).then(() => {

						this.emit("loaded", plugin);
						this.plugins.push(plugin);
						return Promise.resolve(plugin);

					});

				}).catch((err) => {

					return this.uninstallByDirectory(directory, data).then(() => {

						return Promise.reject(
							new Error("Impossible to install \"" + user + "/" + repo + "\" plugin : " + err.message ? err.message : err)
						);

					}).catch((_err) => {
						return this._error("installViaGithub", _err);
					});

				});

			}

			// update

			updateByKey (key, data) {

				return Promise.resolve().then(() => {

					return "number" !== typeof key ?
						Promise.reject(new Error("\"key\" is not an integer")) :
						Promise.resolve();

				}).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					const plugin = this.plugins[key];
					return plugin.unload(data, false).then(() => {

						this.emit("unloaded", plugin);
						this.plugins.splice(key, 1);

						// download plugin
						return !plugin.github ? Promise.resolve() : gitUpdate(plugin.directory);

					}).then(() => {
						return createPluginByDirectory(plugin.directory);
					}).then((_plugin) => {

						// update dependencies & execute update script
						return Promise.resolve().then(() => {
							return !_plugin.dependencies ? Promise.resolve() : npmUpdate(_plugin.directory);
						}).then(() => {
							return _plugin.update(data);
						}).then(() => {

							this.emit("updated", _plugin);
							return _plugin.load(data);

						// execute load script
						}).then(() => {

							this.emit("loaded", _plugin);
							this.plugins.push(_plugin);

							return Promise.resolve(_plugin);

						});

					// remove package-lock.json file
					}).then((_plugin) => {

						const updateFile = path.join(_plugin.directory, "package-lock.json");

						return isFileProm(updateFile).then((exists) => {
							return !exists ? Promise.resolve() : unlinkProm(updateFile);
						});

					}).catch((err) => {
						return this._error("updateByKey", err);
					});

				});

			}

				updateByDirectory (directory, data) {

					return isDirectoryProm(directory).then((exists) => {

						return !exists ?
							Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) :
							Promise.resolve();

					}).then(() => {

						const key = this._directoryToKey(directory);

						return Promise.resolve().then(() => {

							return -1 >= key ?
								Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory")) :
								Promise.resolve();

						}).then(() => {
							return this.updateByKey(key, data);
						});

					});

				}

					update (plugin, data) {

						return plugin && plugin.directory ?
							this.updateByDirectory(plugin.directory, data) :
							Promise.reject(new Error("There is no plugin"));

					}

			// uninstall

			uninstallByKey (key, data) {

				return Promise.resolve().then(() => {

					return "number" !== typeof key ?
						Promise.reject(new Error("\"key\" is not an integer")) :
						Promise.resolve();

				}).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					return this.plugins[key].unload(data).then(() => {

						this.emit("unloaded", this.plugins[key]);
						return this.plugins[key].uninstall(data);

					}).then(() => {

						this.emit("uninstalled", this.plugins[key]);
						return rmdirpProm(this.plugins[key].directory);

					}).then(() => {

						const { name } = this.plugins[key];
						this.plugins.splice(key, 1);

						return Promise.resolve(name);

					}).catch((err) => {
						return this._error("uninstallByKey", err);
					});

				});

			}

				uninstallByDirectory (directory, data) {

					return isDirectoryProm(directory).then((exists) => {

						if (!exists) {
							return Promise.resolve(path.basename(directory));
						}
						else {

							const key = this._directoryToKey(directory);

							return -1 < key ?
									this.uninstallByKey(key, data) :
									rmdirpProm(directory).then(() => {
								return Promise.resolve(path.basename(directory));
							});


						}

					}).catch((err) => {
						return this._error("uninstallByDirectory", err);
					});

				}

					uninstall (plugin, data) {

						return plugin && plugin.directory ?
							this.uninstallByDirectory(plugin.directory, data) :
							Promise.reject(new Error("There is no plugin"));

					}

};
