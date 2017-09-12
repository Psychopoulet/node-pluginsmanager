
"use strict";

// deps

	const path = require("path");
	const { exec, spawn } = require("child_process");
	const fs = require("node-promfs");
	const Plugin = require(path.join(__dirname, "plugin.js"));

// private

	// methods

		/**
		* Return the plugin's key by its directory
		* @param {object} that : reference to "this" pointer
		* @param {string} directory : plugin's directory
		* @returns {number} key
		*/
		function _directoryToKey (that, directory) {

			let result = -1;

				for (let i = 0; i < that.plugins.length; ++i) {

					if (that.plugins[i].directory === directory) {
						result = i;
						break;
					}

				}

			return result;

		}

		/**
		* Generate a Plugin object by its directory
		* @param {string} directory : plugin's directory
		* @returns {object} Promise
		*/
		function _createPluginByDirectory (directory) {

			return fs.isDirectoryProm(directory).then((exists) => {
				return exists ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" does not exist"));
			}).then(() => {
				return path.isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" is not an absolute path"));
			}).then(() => {

				const _Plugin = require(directory);
				let oPlugin = null;

				return Promise.resolve().then(() => {

					return "function" !== typeof _Plugin ?
							Promise.reject(new Error("\"" + directory + "\" is not a function")) :
							Promise.resolve();

				}).then(() => {

					oPlugin = new _Plugin();
					oPlugin.directory = directory;
					oPlugin.name = path.basename(directory);

					return !(oPlugin instanceof Plugin) ?
							Promise.reject(new Error("\"" + path.basename(directory) + "\" is not a plugin class")) :
							oPlugin.loadDataFromPackageFile();

				});

			});

		}

		/**
		* Use for but ordered loading
		* @param {object} that : reference to "this" pointer
		* @param {number} i : plugin's key
		* @param {object|Array|null} data : passed to plugin's "load" method
		* @returns {object} Promise
		*/
		function _loadOrderedNext (that, i, data) {

			if (i >= that.orderedDirectoriesBaseNames.length) {
				return Promise.resolve();
			}
			else {

				return that.loadByDirectory(path.join(that.directory, that.orderedDirectoriesBaseNames[i]), data ? data : null).then(() => {
					return _loadOrderedNext(that, i + 1, data);
				});

			}

		}

		/**
		* Use for unloading
		* @param {object} that : reference to "this" pointer
		* @param {object|Array|null} data : passed to plugin's "load" method
		* @returns {object} Promise
		*/
		function _unloadNext (that, data) {

			return 0 >= that.plugins.length ?
					Promise.resolve() :
					that.unloadByKey(that.plugins.length - 1, data);

		}

		/**
		* Formate std out|err to string
		* @param {Buffer|string} msg : std out|err
		* @returns {string} result
		*/
		function _stdToString (msg) {

			if ("object" === typeof msg) {

				if (msg instanceof Buffer) {
					return msg.toString("utf8");
				}
				else {
					return msg.message ? msg.message : msg;
				}

			}
			else {
				return String(msg);
			}

		}

		/**
		* Enforce generic actions on error
		* @param {object} that : reference to "this" pointer
		* @param {string} fnName : function name
		* @param {string} err : error's message
		* @returns {object} Promise
		*/
		function _error (that, fnName, err) {

			const _err = _stdToString(err);

			that.emit("error", fnName + " : " + _err);
			return Promise.reject(new Error(_err));

		}

		// git

			/**
			* Execute GIT command
			* @param {Array} params : parameters
			* @returns {object} Promise
			*/
			function _GIT (params) {

				return new Promise((resolve, reject) => {

					let result = "";
					const mySpawn = spawn("git", params).on("error", (msg) => {
						result += _stdToString(msg);
					}).on("close", (code) => {
						return code ? reject(new Error(result)) : resolve();
					});

					mySpawn.stdout.on("data", (msg) => {
						result += _stdToString(msg);
					});

					mySpawn.stderr.on("data", (msg) => {
						result += _stdToString(msg);
					});

				});

			}

		// npm

			/**
			* Execute NPM command
			* @param {string} directory : plugin's directory
			* @param {string} command : parameters
			* @returns {object} Promise
			*/
			function _NPM (directory, command) {

				return fs.mkdirpProm(directory).then(() => {

					return new Promise((resolve, reject) => {

						exec("npm " + command, {
							"cwd": directory
						}, (err, stdout, stderr) => {
							return err ? reject(new Error(_stdToString(stderr))) : resolve();
						});

					});

				});

			}

// module

module.exports = class PluginsManager extends require("asynchronous-eventemitter") {

	constructor (directory) {

		super();

		this.directory = directory && "string" === typeof directory ? directory : path.join(__dirname, "plugins");
		this.orderedDirectoriesBaseNames = [];
		this.plugins = [];

		this._beforeLoadAll = null;
		this._maxListeners = 0;

	}

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
				this.orderedDirectoriesBaseNames = pluginsDirectoriesBaseNames;
				return Promise.resolve();
			});

		}

	// inherited

		emit (eventName, eventData) {

			if (0 < this.listenerCount(eventName)) {
				super.emit(eventName, eventData ? eventData : null);
			}

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
				return plugin ? Promise.resolve(plugin) : fs.isDirectoryProm(directory).then((exists) => {

					return !exists ?
						Promise.resolve() : _createPluginByDirectory(directory).then((_plugin) => {

						// load

						plugin = _plugin;
						return plugin.load(data ? data : null);

					}).then(() => {

						this.emit("loaded", plugin);
						this.plugins.push(plugin);

						return Promise.resolve(plugin);

					}).then((_plugin) => {

						for (let i = 0; i < this.plugins.length - 1; ++i) {

							for (let j = i + 1; j < this.plugins.length; ++j) {

								if (this.plugins[i].name > this.plugins[j].name) {

									const tmp = this.plugins[j];

									this.plugins[j] = this.plugins[i];
									this.plugins[i] = tmp;

								}

							}

						}

						return Promise.resolve(_plugin);

					}).catch((err) => {

						return Promise.reject(
							new Error("\"" + (plugin ? plugin.name : path.basename(directory)) + "\" => " + (err.message ? err.message : err))
						).catch((_err) => {
							return _error(this, "loadByDirectory", _err);
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
				return fs.mkdirpProm(this.directory).then(() => {

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
					return fs.readdirProm(this.directory);
				}).then((files) => {

					if (0 >= files.length) {
						this.emit("allloaded");
						return Promise.resolve();
					}
					else {

						return _loadOrderedNext(this, 0, data).then(() => {

							return new Promise((resolve) => {

								let i = files.length;
								files.forEach((file) => {

									this.loadByDirectory(path.join(this.directory, file), data ? data : null).then(() => {

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

				}).catch((err) => {
					return _error(this, "loadAll", err);
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

				return this.plugins[key].unload(data ? data : null).then(() => {

					this.emit("unloaded", this.plugins[key]);
					this.plugins.splice(key, 1);

					return Promise.resolve();

				}).catch((err) => {
					return _error(this, "unloadByKey", err);
				});

			});

		}

			unloadByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					return !exists ?
							Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) :
							Promise.resolve();

				}).then(() => {

					const key = _directoryToKey(this, directory);

					return -1 < key ?
							this.unloadByKey(key, data ? data : null) :
							Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));

				});

			}

				unload (plugin, data) {
					return this.unloadByDirectory(plugin.directory, data ? data : null);
				}

		unloadAll (data) {

			return _unloadNext(this, data).then(() => {
				this.emit("allunloaded");
				return Promise.resolve();
			});

		}

	// write

		// add

		installViaGithub (url, data) {

			return Promise.resolve().then(() => {

				return "string" !== typeof url ?
						Promise.reject(new Error("\"url\" is not a string")) :
						Promise.resolve();

			}).then(() => {

				const _url = url.trim();

				return Promise.resolve().then(() => {

					return "" === _url ?
							Promise.reject(new Error("\"url\" is empty")) :
							Promise.resolve();

				}).then(() => {

					return -1 >= _url.indexOf("github") ?
							Promise.reject(new Error("\"" + _url + "\" is not a valid github url")) :
							Promise.resolve();

				}).then(() => {

					return -1 >= _url.indexOf("https") ?
							Promise.reject(new Error("\"" + _url + "\" is not a valid https url")) :
							Promise.resolve();

				}).then(() => {

					const tabUrl = _url.split("/");
					const directory = path.join(this.directory, tabUrl[tabUrl.length - 1]);

					return fs.isDirectoryProm(directory).then((exists) => {

						return exists ?
								Promise.reject(new Error("\"" + directory + "\" aldready exists")) :
								Promise.resolve();

					}).then(() => {

						// git clone
						return _GIT([
							"-c", "core.quotepath=false", "clone", "--recursive", "--depth", "1",
							_url, directory

						// install dependencies & execute install script
						]).then(() => {
							return _createPluginByDirectory(directory);
						}).then((plugin) => {

							return Promise.resolve().then(() => {
								return !plugin.dependencies ? Promise.resolve() : _NPM(directory, "install");
							}).then(() => {
								return plugin.install(data ? data : null);

							// execute load script
							}).then(() => {

								this.emit("installed", plugin);
								return plugin.load(data ? data : null);

							}).then(() => {

								this.emit("loaded", plugin);
								this.plugins.push(plugin);
								return Promise.resolve(plugin);

							});

						}).catch((err) => {

							return this.uninstallByDirectory(directory, data ? data : null).then(() => {

								return Promise.reject(
									new Error("Impossible to install \"" + _url + "\" plugin : " + err.message ? err.message : err)
								);

							}).catch((_err) => {
								return _error(this, "installViaGithub", _err);
							});

						});

					});

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
				return plugin.unload(data ? data : null, false).then(() => {

					this.emit("unloaded", plugin);
					this.plugins.splice(key, 1);

					// download plugin
					return !plugin.github ? Promise.resolve() : _GIT([ "-c", plugin.directory, "pull" ]);

				}).then(() => {
					return _createPluginByDirectory(plugin.directory);
				}).then((_plugin) => {

					// update dependencies & execute update script
					return Promise.resolve().then(() => {
						return !_plugin.dependencies ? Promise.resolve() : _NPM(_plugin.directory, "update --prod");
					}).then(() => {
						return _plugin.update(data ? data : null);
					}).then(() => {

						this.emit("updated", _plugin);
						return _plugin.load(data ? data : null);

					// execute load script
					}).then(() => {

						this.emit("loaded", _plugin);
						this.plugins.push(_plugin);

						return Promise.resolve(_plugin);

					});

				// remove package-lock.json file
				}).then((_plugin) => {

					const updateFile = path.join(_plugin.directory, "package-lock.json");

					return fs.isFileProm(updateFile).then((exists) => {
						return !exists ? Promise.resolve() : fs.unlinkProm(updateFile);
					});

				}).catch((err) => {
					return _error(this, "updateByKey", err);
				});

			});

		}

			updateByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					return Promise.resolve().then(() => {

						return !exists ?
								Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) :
								Promise.resolve();

					}).then(() => {

						const key = _directoryToKey(this, directory);

						return Promise.resolve().then(() => {

							return -1 >= key ?
									Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory")) :
									Promise.resolve();

						}).then(() => {
							return this.updateByKey(key, data ? data : null);
						});

					});

				});

			}

				update (plugin, data) {
					return this.updateByDirectory(plugin.directory, data ? data : null);
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

				return this.plugins[key].unload(data ? data : null).then(() => {

					this.emit("unloaded", this.plugins[key]);
					return this.plugins[key].uninstall(data ? data : null);

				}).then(() => {

					this.emit("uninstalled", this.plugins[key]);
					return fs.rmdirpProm(this.plugins[key].directory);

				}).then(() => {

					const { name } = this.plugins[key];
					this.plugins.splice(key, 1);

					return Promise.resolve(name);

				}).catch((err) => {
					return _error(this, "uninstallByKey", err);
				});

			});

		}

			uninstallByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					if (!exists) {
						return Promise.resolve(path.basename(directory));
					}
					else {

						const key = _directoryToKey(this, directory);

						return -1 < key ?
								this.uninstallByKey(key, data ? data : null) :
								fs.rmdirpProm(directory).then(() => {
							return Promise.resolve(path.basename(directory));
						});


					}

				}).catch((err) => {
					return _error(this, "uninstallByDirectory", err);
				});

			}

				uninstall (plugin, data) {
					return this.uninstallByDirectory(plugin.directory, data ? data : null);
				}

};
