/*
	eslint max-lines: 0
*/

"use strict";

// deps

	// natives
	const Events = require("events");
	const { basename, join } = require("path");

	// externals
	const {
		isFileProm, mkdirpProm, readdirProm, rmdirpProm, unlinkProm
	} = require("node-promfs");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isInteger = require(join(__dirname, "checkers", "isInteger.js"));
	const isNonEmptyArray = require(join(__dirname, "checkers", "isNonEmptyArray.js"));
	const isNonEmptyString = require(join(__dirname, "checkers", "isNonEmptyString.js"));
	const createPluginByDirectory = require(join(__dirname, "createPluginByDirectory.js"));

	// git
	const gitInstall = require(join(__dirname, "cmd", "git", "install.js"));
	const gitUpdate = require(join(__dirname, "cmd", "git", "update.js"));

	// npm
	const npmInstall = require(join(__dirname, "cmd", "npm", "install.js"));
	const npmUpdate = require(join(__dirname, "cmd", "npm", "update.js"));

// module

module.exports = class PluginsManager extends Events {

	constructor (options) {

		super(options);

		// protected

			this._beforeInitAll = null;
			this._orderedDirectoriesBaseNames = [];
			this._maxListeners = 0;

		// public

			this.directory = options && "undefined" !== typeof options.directory ? options.directory : join(__dirname, "plugins");
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
		* Use for ordered initializing
		* @param {any} data : passed to plugin's "init" method
		* @param {number} i : plugin's key
		* @returns {Promise} Operation's result
		*/
		_initOrderedPlugins (data, i = 0) {

			return i >= this._orderedDirectoriesBaseNames.length ?
				Promise.resolve() :
				this.initByDirectory(join(this.directory, this._orderedDirectoriesBaseNames[i]), data).then(() => {
					return this._initOrderedPlugins(data, i + 1);
				});

		}

		/**
		* Use for releaseing
		* @param {object|Array|null} data : passed to plugin's "init" method
		* @returns {Promise} Operation's result
		*/
		_releaseNext (data) {

			return 0 >= this.plugins.length ?
				Promise.resolve() :
				this.releaseByKey(this.plugins.length - 1, data);

		}

	// public

		// getters

			getPluginsNames () {

				const result = [];

					this.plugins.forEach((plugin) => {
						result.push(plugin.name);
					});

				return result;

			}

		// setters

			setOrder (pluginsDirectoriesBaseNames) {

				return isNonEmptyArray("setOrder/pluginsDirectoriesBaseNames", pluginsDirectoriesBaseNames).then(() => {

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

		// init / release

			beforeInitAll (callback) {

				return isFunction("beforeInitAll/callback", callback).then(() => {
					this._beforeInitAll = callback;
					return Promise.resolve();
				});

			}

			// init

			initByDirectory (directory, data) {

				return isNonEmptyString("initByDirectory/directory", directory).then(() => {

					// is already inited ?
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
						createPluginByDirectory(directory).then((_plugin) => {

							plugin = _plugin;
							return plugin.init(data);

						}).then(() => {

							this.emit("inited", plugin);
							this.plugins.push(plugin);

							return Promise.resolve(plugin);

						});

				});

			}

			initAll (data) {

				return Promise.resolve().then(() => {

					return "" === this.directory ?
						Promise.reject(new Error("\"directory\" is not defined")) :
						Promise.resolve();

				}).then(() => {

					// create dir if not exist
					return mkdirpProm(this.directory).then(() => {

						// execute _beforeInitAll
						return "function" !== typeof this._beforeInitAll ? Promise.resolve() : new Promise((resolve, reject) => {

							const fn = this._beforeInitAll();

							if (!(fn instanceof Promise)) {
								reject(new Error("\"beforeInitAll\" callback's return is not a Promise instance"));
							}
							else {
								fn.then(resolve).catch(reject);
							}

						});

					// init plugins
					}).then(() => {
						return readdirProm(this.directory);
					}).then((files) => {

						if (0 >= files.length) {
							this.emit("allinited");
							return Promise.resolve();
						}
						else {

							return this._initOrderedPlugins(data).then(() => {

								return new Promise((resolve) => {

									let i = files.length;
									files.forEach((file) => {

										this.initByDirectory(join(this.directory, file), data).then(() => {

											i--;
											if (0 === i) {
												this.emit("allinited"); resolve();
											}

										}).catch(() => {

											i--;
											if (0 === i) {
												this.emit("allinited"); resolve();
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

					});

				});

			}

			// release

			releaseByKey (key, data) {

				return isInteger("releaseByKey/key", key).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					return this.plugins[key].release(data).then(() => {

						this.emit("releaseed", this.plugins[key]);
						this.plugins.splice(key, 1);

						return Promise.resolve();

					});

				});

			}

				releaseByDirectory (directory, data) {

					return isAbsoluteDirectory("releaseByDirectory/directory", directory).then((exists) => {

						return !exists ?
							Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) :
							Promise.resolve();

					}).then(() => {

						const key = this._directoryToKey(directory);

						return -1 < key ?
							this.releaseByKey(key, data) :
							Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));

					});

				}

					release (plugin, data) {

						return plugin && plugin.directory ?
							this.releaseByDirectory(plugin.directory, data) :
							Promise.reject(new Error("There is no plugin"));

					}

			releaseAll (data) {

				return this._releaseNext(data).then(() => {
					this.emit("allreleaseed");
					return Promise.resolve();
				});

			}

		// write

			// add

			installViaGithub (user, repo, data) {

				const directory = join(this.directory, repo);

				return gitInstall(directory, user, repo).then(() => {

					// install dependencies & execute install script
					return createPluginByDirectory(directory);

				}).then((plugin) => {

					return Promise.resolve().then(() => {
						return !plugin.dependencies ? Promise.resolve() : npmInstall(directory);
					}).then(() => {
						return plugin.install(data);

					// execute init script
					}).then(() => {

						this.emit("installed", plugin);
						return plugin.init(data);

					}).then(() => {

						this.emit("inited", plugin);
						this.plugins.push(plugin);
						return Promise.resolve(plugin);

					});

				}).catch((err) => {

					return this.uninstallByDirectory(directory, data).then(() => {
						return Promise.reject(err);
					});

				});

			}

			// update

			updateByKey (key, data) {

				return isInteger("updateByKey/key", key).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					const plugin = this.plugins[key];
					return plugin.release(data, false).then(() => {

						this.emit("releaseed", plugin);
						this.plugins.splice(key, 1);

						// downinit plugin
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
							return _plugin.init(data);

						// execute init script
						}).then(() => {

							this.emit("inited", _plugin);
							this.plugins.push(_plugin);

							return Promise.resolve(_plugin);

						});

					// remove package-lock.json file
					}).then((_plugin) => {

						const updateFile = join(_plugin.directory, "package-lock.json");

						return isFileProm(updateFile).then((exists) => {
							return !exists ? Promise.resolve() : unlinkProm(updateFile);
						});

					});

				});

			}

				updateByDirectory (directory, data) {

					return isAbsoluteDirectory("updateByDirectory/directory", directory).then((exists) => {

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

				return isInteger("uninstallByKey/key", key).then(() => {

					return !this.plugins[key] ?
						Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
						Promise.resolve();

				}).then(() => {

					return this.plugins[key].release(data).then(() => {

						this.emit("releaseed", this.plugins[key]);
						return this.plugins[key].uninstall(data);

					}).then(() => {

						this.emit("uninstalled", this.plugins[key]);
						return rmdirpProm(this.plugins[key].directory);

					}).then(() => {

						const { name } = this.plugins[key];
						this.plugins.splice(key, 1);

						return Promise.resolve(name);

					});

				});

			}

				uninstallByDirectory (directory, data) {

					return isAbsoluteDirectory("uninstallByDirectory/directory", directory).then((exists) => {

						if (!exists) {
							return Promise.resolve(basename(directory));
						}
						else {

							const key = this._directoryToKey(directory);

							return -1 < key ?
									this.uninstallByKey(key, data) :
									rmdirpProm(directory).then(() => {
								return Promise.resolve(basename(directory));
							});


						}

					});

				}

					uninstall (plugin, data) {

						return plugin && plugin.directory ?
							this.uninstallByDirectory(plugin.directory, data) :
							Promise.reject(new Error("There is no plugin"));

					}

};
