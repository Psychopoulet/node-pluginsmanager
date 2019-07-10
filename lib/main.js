/*
	eslint-disable max-lines, prefer-destructuring
*/

"use strict";

// deps

	// natives
	const Events = require("events");
	const { join } = require("path");

	// externals
	const {
		mkdirpProm, readdirProm, rmdirpProm
	} = require("node-promfs");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isInteger = require(join(__dirname, "checkers", "isInteger.js"));
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

// module

module.exports = class PluginsManager extends Events {

	constructor (options) {

		super(options);

		// protected

			this._beforeInitAll = null;
			this._orderedPluginsNames = [];
			this._maxListeners = 0;

		// public

			this.directory = options && "undefined" !== typeof options.directory ? options.directory : "";
			this.plugins = [];

	}

	// private

		/**
		* Use for ordered initializing
		* @param {any} data : passed to plugin's "init" method
		* @param {number} i : plugin's key
		* @returns {Promise} Operation's result
		*/
		_initOrderedPlugins (data, i = 0) {

			return i >= this._orderedPluginsNames.length ? Promise.resolve() : this.initByDirectory(
				join(this.directory, this._orderedPluginsNames[i]), data
			).then(() => {

				return this._initOrderedPlugins(data, i + 1);

			});

		}

		/**
		* Use for releasing
		* @param {object|Array|null} data : passed to plugin's "init" method
		* @param {number} i : plugin's key
		* @returns {Promise} Operation's result
		*/
		_releaseLast (data, i = this.plugins.length - 1) {

			return 0 > i ? Promise.resolve() : this.releaseByKey(i, data).then(() => {

				return this._releaseLast(data, i - 1);

			});

		}

	// public

		// getters

			getPluginsNames () {

				return this.plugins.map((plugin) => {
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

					// is already initialiazed ?
					let plugin = null;
					for (let i = 0; i < this.plugins.length; ++i) {

						if (directory === this.plugins[i].directory) {
							plugin = this.plugins[i]; break;
						}

					}

					// is already exists ?
					return plugin ? Promise.resolve(plugin) : createPluginByDirectory(directory).then((_plugin) => {

						plugin = _plugin;

						return plugin.init(data);

					}).then(() => {

						this.emit("initialiazed", plugin);
						this.plugins.push(plugin);

						return Promise.resolve(plugin);

					});

				});

			}

			initAll (data) {

				return isAbsoluteDirectory("initAll/directory", this.directory).then(() => {

					// create dir if not exist
					return mkdirpProm(this.directory);

				}).then(() => {

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

						this.emit("allinitialiazed");

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
											this.emit("allinitialiazed"); resolve();
										}

									}).catch(() => {

										i--;
										if (0 === i) {
											this.emit("allinitialiazed"); resolve();
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

			}

			// release

			release (plugin, data) {

				return isOrchestrator("release/plugin", plugin).then(() => {

					return plugin.release(data);

				}).then(() => {

					this.emit("released", plugin);

					return Promise.resolve();

				});

			}

				releaseByKey (key, data) {

					return isInteger("releaseByKey/key", key).then(() => {

						return !this.plugins[key] ?
							Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
							Promise.resolve();

					}).then(() => {

						return this.release(this.plugins[key], data);

					});

				}

			releaseAll (data) {

				return this._releaseLast(data).then(() => {

					this.emit("allreleased");

					return Promise.resolve();

				});

			}

		// write

			// add

			installViaGithub (user, repo, data) {

				return isAbsoluteDirectory("installViaGithub/directory", this.directory).then(() => {

					const directory = join(this.directory, repo);

					return new Promise((resolve, reject) => {

						isAbsoluteDirectory(directory).then(() => {
							reject(new Error("\"" + repo + "\" plugin already exists"));
						}).catch(() => {
							resolve(directory);
						});

					});

				}).then((directory) => {

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

							this.emit("initialiazed", plugin);
							this.plugins.push(plugin);

							return Promise.resolve(plugin);

						});

					}).catch((err) => {

						return this.uninstallByDirectory(directory, data).then(() => {
							return Promise.reject(err);
						});

					});

				});

			}

			// update

			updateViaGithub (plugin, data) {

				let directory = "";
				let key = -1;

				// check plugin
				return Promise.resolve().then(() => {

					return isOrchestrator("update/plugin", plugin).then(() => {

						return isNonEmptyString("update/github", plugin.github).catch(() => {
							return Promise.reject(new Error("Plugin \"" + plugin.name + "\" must be linked to a github project to be updated"));
						});

					}).then(() => {

						key = this.getPluginsNames().findIndex((pluginName) => {
							return pluginName === plugin.name;
						});

						return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

					});

				// check plugin directory
				}).then(() => {

					return isAbsoluteDirectory("installViaGithub/directory", this.directory).then(() => {

						directory = join(this.directory, plugin.name);

						return isAbsoluteDirectory("installViaGithub/plugindirectory", directory);

					});

				// release plugin
				}).then(() => {

					return this.release(plugin, data).then(() => {

						return plugin.destroy();

					}).then(() => {

						this.plugins[key] = null;

						return Promise.resolve();

					});

				// download plugin
				}).then(() => {

					return gitUpdate(directory).then(() => {

						return createPluginByDirectory(directory);

					});

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

						this.emit("initialiazed", _plugin);
						this.plugins[key] = _plugin;

						return Promise.resolve(_plugin);

					});

				});

			}

				updateByKey (key, data) {

					return isInteger("updateByKey/key", key).then(() => {

						return !this.plugins[key] ?
							Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
							Promise.resolve();

					}).then(() => {

						return this.updateViaGithub(this.plugins[key], data);

					});

				}

			// uninstall

			uninstall (plugin, data) {

				let directory = "";
				let key = -1;
				let name = "";

				// check plugin
				return Promise.resolve().then(() => {

					return isOrchestrator("update/plugin", plugin).then(() => {

						key = this.getPluginsNames().findIndex((pluginName) => {
							return pluginName === plugin.name;
						});

						return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

					});

				// check plugin directory
				}).then(() => {

					return isAbsoluteDirectory("installViaGithub/directory", this.directory).then(() => {

						name = plugin.name;
						directory = join(this.directory, name);

						return isAbsoluteDirectory("installViaGithub/plugindirectory", directory);

					});

				// release plugin
				}).then(() => {

					return this.release(plugin, data).then(() => {

						return plugin.destroy();

					}).then(() => {

						this.plugins.splice(key, 1);

						return Promise.resolve();

					});

				// update dependencies & execute update script
				}).then(() => {

					return Promise.resolve().then(() => {

						return plugin.uninstall(data);

					}).then(() => {

						this.emit("uninstalled", name);

						return rmdirpProm(directory);

					});

				}).then(() => {

					return Promise.resolve(name);

				});

			}

				uninstallByKey (key, data) {

					return isInteger("uninstallByKey/key", key).then(() => {

						return !this.plugins[key] ?
							Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) :
							Promise.resolve();

					}).then(() => {

						return this.uninstall(this.plugins[key], data);

					});

				}

};
