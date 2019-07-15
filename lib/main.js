/*
	eslint-disable max-lines, prefer-destructuring
*/

"use strict";

// deps

	// natives
	const Events = require("events");
	const { join } = require("path");

	// externals
	const versionModulesChecker = require("check-version-modules");
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

		_checkPluginsModules (i = 0) {

			return i >= this.plugins.length ? Promise.resolve() : this.checkModules(this.plugins[i]).then(() => {

				return this._checkPluginsModules(i + 1);

			});

		}

		_initOrderedPlugins (data, i = 0) {

			return i >= this._orderedPluginsNames.length ? Promise.resolve() : this._initByDirectory(
				join(this.directory, this._orderedPluginsNames[i]), data
			).then(() => {

				return this._initOrderedPlugins(data, i + 1);

			});

		}

		_initByDirectory (directory, data) {

			return isNonEmptyString("_initByDirectory/directory", directory).then(() => {

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

		_releaseLast (data, i = this.plugins.length - 1) {

			return 0 > i ? Promise.resolve() : isInteger("_releaseLast/key", i).then(() => {

				return !this.plugins[i] ?
					Promise.reject(new Error("There is no \"" + i + "\" plugin's key")) :
					Promise.resolve();

			}).then(() => {

				return this.plugins[i].release(data).then(() => {

					this.emit("released", this.plugins[i].name);

					return Promise.resolve();

				});

			}).then(() => {

				return this._releaseLast(data, i - 1);

			});

		}

		_destroyLast (data, i = this.plugins.length - 1) {

			return 0 > i ? Promise.resolve() : isInteger("_destroyLast/key", i).then(() => {

				return !this.plugins[i] ?
					Promise.reject(new Error("There is no \"" + i + "\" plugin's key")) :
					Promise.resolve();

			}).then(() => {

				return this.plugins[i].destroy(data).then(() => {

					this.emit("destroyed", this.plugins[i].name);

					return Promise.resolve();

				});

			}).then(() => {

				return this._destroyLast(data, i - 1);

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

		// checkers

			checkAllModules () {

				return this._checkPluginsModules();

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

		// init / release

			beforeInitAll (callback) {

				return isFunction("beforeInitAll/callback", callback).then(() => {

					this._beforeInitAll = callback;

					return Promise.resolve();

				});

			}

			// init

			initAll (data) {

				return isAbsoluteDirectory("initAll/directory", this.directory).then(() => {

					// create dir if not exist
					return mkdirpProm(this.directory);

				}).then(() => {

					// execute _beforeInitAll
					return "function" !== typeof this._beforeInitAll ? Promise.resolve() : new Promise((resolve, reject) => {

						const fn = this._beforeInitAll();

						if (!(fn instanceof Promise)) {
							resolve();
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

							const initializedPlugins = this.plugins.map((plugin) => {
								return plugin.name;
							});

							const restToInitialize = files.filter((file) => {
								return !initializedPlugins.includes(file);
							});

							return 0 >= restToInitialize.length ? Promise.resolve() : new Promise((resolve) => {

								let i = restToInitialize.length;
								restToInitialize.forEach((file) => {

									this._initByDirectory(join(this.directory, file), data).then(() => {

										i--;
										if (0 === i) {
											resolve();
										}

									}).catch(() => {

										i--;
										if (0 === i) {
											resolve();
										}

									});

								});

							});

						});

					}

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

					this.emit("allinitialiazed");

					return Promise.resolve();

				});

			}

			// release

			releaseAll (data) {

				return this._releaseLast(data).then(() => {

					this.emit("allreleased");

					return Promise.resolve();

				});

			}

			destroyAll (data) {

				return this._destroyLast(data).then(() => {

					this.plugins = [];

					this.emit("alldestroyed");

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

					return Promise.resolve().then(() => {

						return gitInstall(directory, user, repo);

					}).then(() => {

						// install dependencies & execute install script
						return createPluginByDirectory(directory);

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

							this.emit("installed", plugin);

							return plugin.init(data);

						}).then(() => {

							this.emit("initialiazed", plugin);
							this.plugins.push(plugin);

							return Promise.resolve(plugin);

						}).catch((err) => {

							return this.uninstall(plugin, data).then(() => {
								return Promise.reject(err);
							});

						});

					}).catch((err) => {

						return new Promise((resolve, reject) => {

							isAbsoluteDirectory(directory).then(() => {

								return rmdirpProm(directory).then(() => {
									reject(err);
								});

							}).catch(() => {
								reject(err);
							});

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

					return isOrchestrator("updateViaGithub/plugin", plugin).then(() => {

						let github = "";
						if ("string" === typeof plugin.github) {
							github = plugin.github;
						}
						else if ("string" === typeof plugin.repository) {
							github = plugin.repository;
						}
						else if ("string" === typeof plugin.repository.url) {
							github = plugin.repository.url;
						}

						return isNonEmptyString("updateViaGithub/github", github).catch(() => {
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

					return isAbsoluteDirectory("updateViaGithub/directory", this.directory).then(() => {

						directory = join(this.directory, plugin.name);

						return isAbsoluteDirectory("updateViaGithub/plugindirectory", directory);

					});

				// release plugin
				}).then(() => {

					const pluginName = plugin.name;

					return plugin.release(data).then(() => {

						this.emit("released", pluginName);

						return plugin.destroy(data);

					}).then(() => {

						this.emit("destroyed", pluginName);

						this.plugins[key] = null;

						return Promise.resolve();

					});

				// download plugin
				}).then(() => {

					return gitUpdate(directory).then(() => {

						return createPluginByDirectory(directory);

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

			// uninstall

			uninstall (plugin, data) {

				let directory = "";
				let key = -1;
				let name = "";

				// check plugin
				return Promise.resolve().then(() => {

					return isOrchestrator("uninstall/plugin", plugin).then(() => {

						key = this.getPluginsNames().findIndex((pluginName) => {
							return pluginName === plugin.name;
						});

						return -1 < key ? Promise.resolve() : Promise.reject(new Error("Plugin \"" + plugin.name + "\" is not registered"));

					});

				// check plugin directory
				}).then(() => {

					return isAbsoluteDirectory("uninstall/directory", this.directory).then(() => {

						name = plugin.name;
						directory = join(this.directory, name);

						return isAbsoluteDirectory("uninstall/plugindirectory", directory);

					});

				// release plugin
				}).then(() => {

					const pluginName = plugin.name;

					return plugin.release(data).then(() => {

						this.emit("released", pluginName);

						return plugin.destroy(data);

					}).then(() => {

						this.emit("destroyed", pluginName);

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

};
