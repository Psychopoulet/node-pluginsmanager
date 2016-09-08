
"use strict";

// deps
	
const 	path = require("path"),
		spawn = require("child_process").spawn,
		
		fs = require("node-promfs"),
		
		plugin = require(path.join(__dirname, "plugin.js"));

// private

	// attrs

		var _beforeLoadAll = null;

	// methods
	
		function _executeGIT(params) {

			if (-1 >= process.env.PATH.indexOf("Git") && -1 >= process.env.PATH.indexOf("git")) {
				return Promise.reject("\"git\" is probably not registered in your PATH");
			}
			else {

				return new Promise((resolve, reject) => {

					let oSpawn, sResult = "";

						oSpawn = spawn("git", params);

						oSpawn.stdout.on("data", (data) => {
							sResult += data;
						});

						oSpawn.stderr.on("data", (err) => {
							sResult += ((err.message) ? err.message : err);
						});

						oSpawn.on("error", (err) => {
							sResult += ((err.message) ? err.message : err);
						})

						.on("close", (code) => {

							if (code) {
								reject(sResult);
							}
							else {
								resolve();
							}
							
						});

				});
				
			}
				
		}

		function _createPluginByDirectory(dir) {

			return fs.isDirectoryProm(dir).then((exists) => {

				if (!exists) {
					return Promise.reject("\"" + dir + "\" does not exist");
				}
				else if (!path.isAbsolute(dir)) {
					return Promise.reject("\"" + dir + "\" is not an absolute path");
				}
				else {

					let _Plugin = require(dir), oPlugin;

					if ("function" !== typeof _Plugin) {
						return Promise.reject("\"" + dir + "\" is not a function");
					}
					else {

						oPlugin = new _Plugin();
						oPlugin.directory = dir;
						oPlugin.name = path.basename(dir);

						if (!(oPlugin instanceof plugin)) {
							return Promise.reject("\"" + path.basename(dir) + "\" is not a plugin class");
						}
						else {
							return oPlugin.loadDataFromPackageFile();
						}

					}

				}

			});
			
		}

		function _error(that, fnName, err) {

			err = (err.message) ? err.message : err;

			that.emit("error", fnName + " : " + err);
			return Promise.reject(err);

		}

// module

module.exports = class PluginsManager extends require("asynchronous-eventemitter") {

	constructor (directory) {

		super();

		this.directory = (directory && "string" === typeof directory) ? directory : path.join(__dirname, "plugins");
		this.plugins = [];

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

	// load

		loadByDirectory (directory, data) {

			if ("string" !== typeof directory) {
				return _error(this, "loadByDirectory", "\"directory\" is not a string");
			}
			else {

				let plugin;
				return _createPluginByDirectory(directory).then((_plugin) => {

					plugin = _plugin;
					return plugin.load((data) ? data : null);

				}).then(() => {

					this.emit("loaded", plugin);
					this.plugins.push(plugin);

					return Promise.resolve(plugin);

				}).catch((err) => {
					err = (err) ? (err.message) ? err.message : err : "No error given";
					return _error(this, "loadByDirectory", ((plugin) ? plugin.name + " => " + err : err));
				});

			}

		}

		beforeLoadAll(callback) {

			if ("function" !== typeof callback) {
				return _error(this, "beforeLoadAll", "This is not a function");
			}
			else {
				_beforeLoadAll = callback;
				return Promise.resolve();
			}

		}

		loadAll (data) {

			if ("" == this.directory) {
				return _error(this, "loadAll", "\"directory\" is not defined");
			}
			else {

				return fs.mkdirpProm(this.directory).then(() => {

					let fn;

					if ("function" !== typeof _beforeLoadAll) {
						fn = Promise.resolve();
					}
					else {

						fn = _beforeLoadAll();

						if (!(fn instanceof Promise)) {
							fn = Promise.reject("\"beforeLoadAll\" callback's return is not a Promise instance");
						}

					}

					return fn.then(() => {
						return fs.readdirProm(this.directory);
					}).then((files) => {

						if (0 >= files.length) {
							this.emit("allloaded");
							return Promise.resolve();
						}
						else {

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
							
						}

					});

				}).catch((err) => {
					return _error(this, "loadAll", err);
				});

			}

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

					let tabUrl = url.split("/"), dir = path.join(this.directory, tabUrl[tabUrl.length - 1]);

					return fs.isDirectoryProm(dir).then((exists) => {

						if (exists) {
							return Promise.reject("\"" + dir + "\" aldready exists");
						}
						else {

							let plugin;
							return _executeGIT([
								"-c", "core.quotepath=false", "clone", "--recursive", "--depth=1",
								url, dir
							]).then(() => {
								return _createPluginByDirectory(dir);
							}).then((_plugin) => {

								plugin = _plugin;
								return plugin.install((data) ? data : null);

							}).then(() => {

								this.emit("installed", plugin);
								return plugin.load((data) ? data : null);

							}).then(() => {

								this.emit("loaded", plugin);
								this.plugins.push(plugin);
								return Promise.resolve(plugin);

							}).catch((err) => {

								return this.uninstallByDirectory(dir, (data) ? data : null).then(() => {
									return Promise.reject("Impossible to install \"" + url + "\" plugin : " + err);
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
			else if (!this.plugins[key].github) {
				return _error(this, "updateByKey", "There is no known way to update this plugin");
			}
			else {

				let dir = this.plugins[key].directory, plugin;

				return this.plugins[key].unload((data) ? data : null, false).then(() => {

					this.emit("unloaded", this.plugins[key]);
					this.plugins.splice(key, 1);

					return _executeGIT([ "-c", dir, "pull" ]).then(() => {
						return _createPluginByDirectory(dir);
					}).then((_plugin) => {

						plugin = _plugin;
						return plugin.update((data) ? data : null);

					}).then(() => {

						this.emit("updated", plugin);
						return plugin.load((data) ? data : null);

					}).then(() => {

						this.emit("loaded", plugin);
						this.plugins.push(plugin);
						return Promise.resolve(plugin);

					}).catch((err) => {

						return this.uninstallByDirectory(dir, (data) ? data : null).then(() => {
							return Promise.reject("Impossible to update \"" + dir + "\" directory : " + err);
						});

					});

				}).catch((err) => {
					return _error(this, "updateByKey", err);
				});

			}

		}

		updateByDirectory (directory, data) {

			return fs.isDirectoryProm(directory).then((exists) => {

				if (!exists) {
					return _error(this, "updateByDirectory", "There is no \"" + directory + "\" plugin's directory");
				}
				else {

					let key = -1;

					for (let i = 0; i < this.plugins.length; ++i) {
						if (this.plugins[i].directory === directory) { key = i; break; }
					}

					if (-1 < key) {
						return this.updateByKey(key, (data) ? data : null);
					}
					else {
						return Promise.reject("Impossible to find \"" + directory + "\" plugin's directory");
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

		uninstallByDirectory (dir, data) {

			return fs.isDirectoryProm(dir).then((exists) => {

				if (!exists) {
					return Promise.resolve(path.basename(dir));
				}
				else {

					let key = -1;

					for (let i = 0; i < this.plugins.length; ++i) {
						if (this.plugins[i].directory === dir) { key = i; break; }
					}

					if (-1 < key) {
						return this.uninstallByKey(key, (data) ? data : null);
					}
					else {

						return fs.rmdirpProm(dir).then(() => {
							return Promise.resolve(path.basename(dir));
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
