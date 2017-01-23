
"use strict";

// deps
	
const 	path = require("path"),
		exec = require("child_process").exec,
		spawn = require("child_process").spawn,
		fs = require("node-promfs"),
		plugin = require(path.join(__dirname, "plugin.js"));

// private

	// methods

		function _directoryToKey(that, directory) {

			let result = -1;

				for (let i = 0; i < that.plugins.length; ++i) {
					if (that.plugins[i].directory === directory) { result = i; break; }
				}

			return result;

		}

		function _createPluginByDirectory(directory) {

			return fs.isDirectoryProm(directory).then((exists) => {

				if (!exists) {
					return Promise.reject(new Error("\"" + directory + "\" does not exist"));
				}
				else if (!path.isAbsolute(directory)) {
					return Promise.reject(new Error("\"" + directory + "\" is not an absolute path"));
				}
				else {

					let _Plugin = require(directory), oPlugin;

					if ("function" !== typeof _Plugin) {
						return Promise.reject(new Error("\"" + directory + "\" is not a function"));
					}
					else {

						oPlugin = new _Plugin();
						oPlugin.directory = directory;
						oPlugin.name = path.basename(directory);

						if (!(oPlugin instanceof plugin)) {
							return Promise.reject(new Error("\"" + path.basename(directory) + "\" is not a plugin class"));
						}
						else {
							return oPlugin.loadDataFromPackageFile();
						}

					}

				}

			});
			
		}

		function _loadOrderedNext(that, i, data) {

			if (i >= that.orderedDirectoriesBaseNames.length) {
				return Promise.resolve();
			}
			else {

				return that.loadByDirectory(path.join(that.directory, that.orderedDirectoriesBaseNames[i]), (data) ? data : null).then(() => {
					return _loadOrderedNext(that, i + 1, data);
				});

			}

		}

		function _unloadNext(that, data) {

			if (0 >= that.plugins.length) {
				return Promise.resolve();
			}
			else {
				return that.unloadByKey(that.plugins.length - 1, data);
			}

		}

		function _stdToString(msg) {

			if ("object" === typeof msg) {

				if (msg instanceof Buffer) {
					msg = msg.toString("utf8");
				}
				else {
					msg = (msg.message) ? msg.message : msg;
				}

			}

			return msg;

		}

		function _error(that, fnName, err) {

			err = _stdToString(err);

			that.emit("error", fnName + " : " + err);
			return Promise.reject(new Error(err));

		}

		// git

			function _GIT(params) {

				if (-1 >= process.env.PATH.indexOf("Git") && -1 >= process.env.PATH.indexOf("git")) {
					return Promise.reject(new Error("\"git\" is probably not registered in your PATH"));
				}
				else {

					return new Promise((resolve, reject) => {

						let result = "", mySpawn = spawn("git", params).on("error", (msg) => {
							result += _stdToString(msg);
						}).on("close", (code) => {

							if (code) {
								reject(new Error(result));
							}
							else {
								resolve();
							}
							
						});

						mySpawn.stdout.on("data", (msg) => {
							result += _stdToString(msg);
						});

						mySpawn.stderr.on("data", (msg) => {
							result += _stdToString(msg);
						});

					});
			
				}
				
			}

		// npm

			function _NPM(directory, command) {

				if (-1 >= process.env.PATH.indexOf("npm")) {
					return Promise.reject(new Error("\"npm\" is probably not registered in your PATH"));
				}
				else {

					return fs.mkdirpProm(directory).then(() => {

						return new Promise((resolve, reject) => {

							exec("cd \"" + directory + "\" && npm " + command, function (err, stdout, stderr) {

								if (err) {
									reject(new Error(_stdToString(stderr)));
								}
								else {
									resolve();
								}

							});

						});

					});

				}
				
			}

// module

module.exports = class PluginsManager extends require("asynchronous-eventemitter") {

	constructor (directory) {

		super();

		this.directory = (directory && "string" === typeof directory) ? directory : path.join(__dirname, "plugins");
		this.orderedDirectoriesBaseNames = [];
		this.plugins = [];

		this._beforeLoadAll = null;
		this._maxListeners = 0;

	}

	// getters

		static get plugin() { return plugin; }

		getPluginsNames () {

			let result = [];

				this.plugins.forEach((plugin) => {
					result.push(plugin.name);
				});

			return result;

		}

	// setters

		setOrder (pluginsDirectoriesBaseNames) {

			if ("object" !== typeof pluginsDirectoriesBaseNames || !(pluginsDirectoriesBaseNames instanceof Array)) {
				return _error(this, "setOrder", "This is not an array");
			}
			else {

				let errors = [];
				for (let i = 0; i < pluginsDirectoriesBaseNames.length; ++i) {

					if ("string" !== typeof pluginsDirectoriesBaseNames[i]) {
						errors.push("The directory at index \"" + i + "\" must be a string");
					}
					else if ("" === pluginsDirectoriesBaseNames[i].trim()) {
						errors.push("The directory at index \"" + i + "\" must be not empty");
					}

				}

				if (errors.length) {
					return _error(this, "setOrder", errors.join("\r\n"));
				}
				else {
					this.orderedDirectoriesBaseNames = pluginsDirectoriesBaseNames;
					return Promise.resolve();
				}

			}

		}

	// inherited

		emit(eventName, eventData) {

			if (0 < this.listenerCount(eventName)) {

				if (eventData) {
					super.emit(eventName, eventData);
				}
				else {
					super.emit(eventName);
				}

			}

		}

	// load / unload

		beforeLoadAll(callback) {

			if ("function" !== typeof callback) {
				return _error(this, "beforeLoadAll", "This is not a function");
			}
			else {
				this._beforeLoadAll = callback;
				return Promise.resolve();
			}

		}

		// load

		loadByDirectory (directory, data) {

			if ("string" !== typeof directory) {
				return _error(this, "loadByDirectory", "\"directory\" parameter is not a string");
			}
			else {

				let plugin = null;
				for(let i = 0; i < this.plugins.length; ++i) {

					if (directory == this.plugins[i].directory) {
						plugin = this.plugins[i];
						break;
					}

				}

				if (plugin) {
					return Promise.resolve(plugin);
				}
				else {

					return _createPluginByDirectory(directory).then((_plugin) => {

						plugin = _plugin;
						return plugin.load((data) ? data : null);

					}).then(() => {

						this.emit("loaded", plugin);
						this.plugins.push(plugin);

						return Promise.resolve(plugin);

					}).then((plugin) => {

						for (let i = 0; i < this.plugins.length - 1; ++i) {

							for (let j = i + 1; j < this.plugins.length; ++j) {

								if (this.plugins[i].name > this.plugins[j].name) {

									let tmp = this.plugins[j];

									this.plugins[j] = this.plugins[i];
									this.plugins[i] = tmp;

								}

							}

						}

						return Promise.resolve(plugin);

					}).catch((err) => {
						err = (err) ? (err.message) ? err.message : err : "No error given";
						return _error(this, "loadByDirectory", "\"" + ((plugin) ? plugin.name : path.basename(directory)) + "\" => " + err);
					});
					
				}

			}

		}

		loadAll (data) {
			
			if ("" == this.directory) {
				return _error(this, "loadAll", "\"directory\" is not defined");
			}
			else {

				return fs.mkdirpProm(this.directory).then(() => {

					if ("function" !== typeof this._beforeLoadAll) {
						return Promise.resolve();
					}
					else {

						return new Promise((resolve, reject) => {

							let fn = this._beforeLoadAll();

							if (!(fn instanceof Promise)) {
								reject(new Error("\"beforeLoadAll\" callback's return is not a Promise instance"));
							}
							else {
								fn.then(resolve).catch(reject);
							}

						});

					}

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

									this.loadByDirectory(path.join(this.directory, file), (data) ? data : null).then(() => {

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

			}

		}

		// unload

		unloadByKey (key, data) {

			if ("number" !== typeof key) {
				return _error(this, "unloadByKey", "\"key\" is not an integer");
			}
			else if (!this.plugins[key]) {
				return _error(this, "unloadByKey", "There is no \"" + key + "\" plugin's key");
			}
			else {

				return this.plugins[key].unload((data) ? data : null).then(() => {
					this.emit("unloaded", this.plugins[key]);
					this.plugins.splice(key, 1);
					return Promise.resolve();
				});

			}

		}

			unloadByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					if (!exists) {
						return _error(this, "unloadByDirectory", "There is no \"" + directory + "\" plugin's directory");
					}
					else {

						let key = _directoryToKey(this, directory);
						if (-1 < key) {
							return this.unloadByKey(key, (data) ? data : null);
						}
						else {
							return Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));
						}

					}

				}).catch((err) => {
					return _error(this, "unloadByDirectory", err);
				});

			}

				unload (plugin, data) {

					return this.unloadByDirectory(plugin.directory, (data) ? data : null).catch((err) => {
						return _error(this, "unload", err);
					});

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

			if ("string" !== typeof url) {
				return _error(this, "installViaGithub", "\"url\" is not a string");
			}
			else {

				url = url.trim();

				if ("" == url) {
					return _error(this, "installViaGithub", "\"url\" is empty");
				}
				else if (-1 == url.indexOf("github")) {
					return _error(this, "installViaGithub", "\"" + url + "\" is not a valid github url");
				}
				else if (-1 == url.indexOf("https")) {
					return _error(this, "installViaGithub", "\"" + url + "\" is not a valid https url");
				}
				else {

					let tabUrl = url.split("/"), directory = path.join(this.directory, tabUrl[tabUrl.length - 1]);

					return fs.isDirectoryProm(directory).then((exists) => {

						if (exists) {
							return Promise.reject(new Error("\"" + directory + "\" aldready exists"));
						}
						else {

							// git clone
							return _GIT([
								"-c", "core.quotepath=false", "clone", "--recursive", "--depth", "1",
								url, directory
							]).then(() => {
								return _createPluginByDirectory(directory);
							}).then((plugin) => {

								return Promise.resolve().then(() => {

									if (plugin.dependencies) {
										return _NPM(directory, "install");
									}
									else {
										return Promise.resolve();
									}

								}).then(() => {

									return plugin.install((data) ? data : null).then(() => {

										this.emit("installed", plugin);
										return plugin.load((data) ? data : null);

									}).then(() => {

										this.emit("loaded", plugin);
										this.plugins.push(plugin);
										return Promise.resolve(plugin);

									});

								});
								
							}).catch((err) => {

								return this.uninstallByDirectory(directory, (data) ? data : null).then(() => {
									return Promise.reject(new Error("Impossible to install \"" + url + "\" plugin : " + (err.message) ? err.message : err));
								});

							});

						}

					}).catch((err) => {
						return _error(this, "installViaGithub", err);
					});

				}
				
			}

		}

		// update

		updateByKey (key, data) {

			if ("number" !== typeof key) {
				return _error(this, "updateByKey", "\"key\" is not an integer");
			}
			else if (!this.plugins[key]) {
				return _error(this, "updateByKey", "There is no \"" + key + "\" plugin's key");
			}
			else {

				let plugin = this.plugins[key];
				return plugin.unload((data) ? data : null, false).then(() => {

					this.emit("unloaded", plugin);
					this.plugins.splice(key, 1);

					if (!plugin.github) {
						return Promise.resolve();
					}
					else {
						// git update
						return _GIT([ "-c", plugin.directory, "pull" ])(plugin.directory);
					}

				}).then(() => {
					return _createPluginByDirectory(plugin.directory);
				}).then((plugin) => {

					return Promise.resolve().then(() => {

						if (plugin.dependencies) {
							return _NPM(plugin.directory, "update --prod");
						}
						else {
							return Promise.resolve();
						}

					}).then(() => {
						return plugin.update((data) ? data : null);
					}).then(() => {

						this.emit("updated", plugin);
						return plugin.load((data) ? data : null);

					}).then(() => {

						this.emit("loaded", plugin);
						this.plugins.push(plugin);

						return Promise.resolve(plugin);

					});

				}).catch((err) => {

					return this.uninstallByDirectory(plugin.directory, (data) ? data : null).then(() => {
						return Promise.reject(new Error("Impossible to update \"" + plugin.name + "\" : " + err));
					});

				});

			}

		}

			updateByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					if (!exists) {
						return _error(this, "updateByDirectory", "There is no \"" + directory + "\" plugin's directory");
					}
					else {

						let key = _directoryToKey(this, directory);
						if (-1 < key) {
							return this.updateByKey(key, (data) ? data : null);
						}
						else {
							return Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));
						}

					}

				}).catch((err) => {
					return _error(this, "updateByDirectory", err);
				});

			}

				update (plugin, data) {

					return this.updateByDirectory(plugin.directory, (data) ? data : null).catch((err) => {
						return _error(this, "update", err);
					});

				}

		// uninstall

		uninstallByKey (key, data) {

			if ("number" !== typeof key) {
				return _error(this, "uninstallByKey", "\"key\" is not an integer");
			}
			else if (!this.plugins[key]) {
				return _error(this, "uninstallByKey", "There is no \"" + key + "\" plugin's key");
			}
			else {

				return this.plugins[key].unload((data) ? data : null).then(() => {

					this.emit("unloaded", this.plugins[key]);
					return this.plugins[key].uninstall((data) ? data : null);

				}).then(() => {

					this.emit("uninstalled", this.plugins[key]);
					return fs.rmdirpProm(this.plugins[key].directory);

				}).then(() => {

					let name = this.plugins[key].name;
					this.plugins.splice(key, 1);

					return Promise.resolve(name);

				}).catch((err) => {
					return _error(this, "uninstallByKey", err);
				});

			}

		}

			uninstallByDirectory (directory, data) {

				return fs.isDirectoryProm(directory).then((exists) => {

					if (!exists) {
						return Promise.resolve(path.basename(directory));
					}
					else {

						let key = _directoryToKey(this, directory);
						if (-1 < key) {
							return this.uninstallByKey(key, (data) ? data : null);
						}
						else {

							return fs.rmdirpProm(directory).then(() => {
								return Promise.resolve(path.basename(directory));
							});

						}

					}

				}).catch((err) => {
					return _error(this, "uninstallByDirectory", err);
				});

			}

				uninstall (plugin, data) {

					return this.uninstallByDirectory(plugin.directory, (data) ? data : null).catch((err) => {
						return _error(this, "uninstall", err);
					});

				}

};
