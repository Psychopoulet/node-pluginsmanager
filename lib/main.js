
"use strict";

// deps
	
const 	path = require("path"),
		spawn = require("child_process").spawn,
		
		fs = require("simplefs"),
		
		plugin = require(path.join(__dirname, "plugin.js"));

// private
	
function _executeGIT(params) {

	try {

		if (-1 >= process.env.PATH.indexOf("Git") && -1 >= process.env.PATH.indexOf("git")) {
			return Promise.reject("\"git\" is probably not registered in your PATH");
		}
		else {

			return new Promise(function(resolve, reject) {

				let oSpawn, sResult = "";

					oSpawn = spawn("git", params);

					oSpawn.stdout.on("data", function(data) {
						sResult += data;
					});

					oSpawn.stderr.on("data", function(err) {
						sResult += ((err.message) ? err.message : err);
					});

					oSpawn.on("error", function(err) {
						sResult += ((err.message) ? err.message : err);
					})

					.on("close", function (code) {

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
	catch(e) {
		return Promise.reject((e.message) ? e.message : e);
	}

}

function _createPluginByDirectory(dir) {

	try {

		return fs.isDirectoryProm(dir).then(function(exists) {

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
	catch(e) {
		return Promise.reject((e.message) ? e.message : e);
	}

}

function _error(that, fnName, err) {

	err = (err.message) ? err.message : err;

	that.emit("error", fnName + " : " + err);
	return Promise.reject(err);

}

// module

module.exports = class PluginsManager extends require("events").EventEmitter {

	constructor (directory) {

		super();

		this.directory = (directory) ? directory : path.join(__dirname, "plugins");
		this.plugins = [];

	}

	// getters

		static get plugin() { return plugin; }

		getPluginsNames () {

			let result = [];

				this.plugins.forEach(function (plugin) {
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

		loadByDirectory (dir, data) {

			try {

				let plugin, that = this;
				return _createPluginByDirectory(dir).then(function(_plugin) {

					plugin = _plugin;
					return plugin.load((data) ? data : null);

				}).then(function() {

					that.emit("loaded", plugin);
					that.plugins.push(plugin);

					return Promise.resolve(plugin);

				}).catch(function(err) {
					return _error(that, "loadByDirectory", ((plugin) ? plugin.name + " => " + err : err));
				});

			}
			catch(e) {
				return _error(this, "loadByDirectory", e);
			}

		}

		loadAll (data) {

			try {

				if ("" == this.directory) {
					return _error(this, "loadAll", "\"directory\" is not defined");
				}
				else {

					let that = this;
					return fs.isDirectoryProm(this.directory).then(function(exists) {

						if (!exists) {
							return Promise.reject("\"" + that.directory + "\" does not exist");
						}
						else if (!path.isAbsolute(that.directory)) {
							return Promise.reject("\"" + that.directory + "\" is not an absolute path");
						}
						else {

							return fs.readdirProm(that.directory).then(function (files) {

								if (0 >= files.length) {
									that.emit("allloaded");
									return Promise.resolve();
								}
								else {

									return new Promise(function(resolve) {

										let i = files.length;
										files.forEach(function(file) {

											that.loadByDirectory(path.join(that.directory, file), (data) ? data : null).then(function() {

												i--;
												if (0 === i) {
													that.emit("allloaded"); resolve();
												}

											}).catch(function() {

												i--;
												if (0 === i) {
													that.emit("allloaded"); resolve();
												}

											});

										});

									});
									
								}

							});

						}

					}).catch(function(err) {
						return _error(that, "loadAll", err);
					});

				}

			}
			catch(e) {
				return _error(this, "loadAll", e);
			}

		}

	// write

		// add

		installViaGithub (url, data) {

			try {

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

					let that = this;
					return fs.isDirectoryProm(dir).then(function(exists) {

						if (exists) {
							return Promise.reject("\"" + dir + "\" aldready exists");
						}
						else {

							let plugin;
							return _executeGIT([
								"-c", "core.quotepath=false", "clone", "--recursive", "--depth=1",
								url, dir
							]).then(function() {
								return _createPluginByDirectory(dir);
							}).then(function(_plugin) {

								plugin = _plugin;
								return plugin.install((data) ? data : null);

							}).then(function() {

								that.emit("installed", plugin);
								return plugin.load((data) ? data : null);

							}).then(function() {

								that.emit("loaded", plugin);
								that.plugins.push(plugin);
								return Promise.resolve(plugin);

							}).catch(function(err) {

								return that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
									return Promise.reject("Impossible to install \"" + url + "\" plugin : " + err);
								});

							});

						}

					}).catch(function(err) {
						return _error(that, "installViaGithub", err);
					});

				}

			}
			catch(e) {
				return _error(this, "installViaGithub", e);
			}

		}

		// update

		updateByKey (key, data) {

			try {

				if (!this.plugins[key]) {
					return _error(this, "updateByKey", "There is no \"" + key + "\" plugin's key");
				}
				else if (!this.plugins[key].github) {
					return _error(this, "updateByKey", "There is no known way to update this plugin");
				}
				else {

					let dir = this.plugins[key].directory, plugin, that = this;

					return this.plugins[key].unload((data) ? data : null, false).then(function() {

						that.emit("unloaded", that.plugins[key]);
						that.plugins.splice(key, 1);

						return _executeGIT([ "-c", dir, "pull" ]).then(function() {
							return _createPluginByDirectory(dir);
						}).then(function(_plugin) {

							plugin = _plugin;
							return plugin.update((data) ? data : null);

						}).then(function() {

							that.emit("updated", plugin);
							return plugin.load((data) ? data : null);

						}).then(function() {

							that.emit("loaded", plugin);
							that.plugins.push(plugin);
							return Promise.resolve(plugin);

						}).catch(function(err) {

							return that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
								return Promise.reject("Impossible to update \"" + dir + "\" directory : " + err);
							});

						});

					}).catch(function(err) {
						return _error(that, "updateByKey", err);
					});

				}

			}
			catch(e) {
				return _error(this, "updateByKey", e);
			}

		}

		updateByDirectory (dir, data) {

			try {

				let that = this;
				return fs.isDirectoryProm(dir).then(function(exists) {

					if (!exists) {
						return _error(that, "updateByDirectory", "There is no \"" + dir + "\" plugin's directory");
					}
					else {

						let key = -1;

						for (let i = 0; i < that.plugins.length; ++i) {
							if (that.plugins[i].directory === dir) { key = i; break; }
						}

						if (-1 < key) {
							return that.updateByKey(key, (data) ? data : null);
						}
						else {
							return Promise.reject("Impossible to find \"" + dir + "\" plugin's directory");
						}

					}

				}).catch(function(err) {
					return _error(that, "updateByDirectory", err);
				});

			}
			catch(e) {
				return _error(this, "updateByDirectory", e);
			}

		}

		update (plugin, data) {

			let that = this;
			return this.updateByDirectory(plugin.directory, (data) ? data : null).catch(function(err) {
				return _error(that, "update", err);
			});

		}

		// uninstall

		uninstallByKey (key, data) {

			try {

				if (!this.plugins[key]) {
					return _error(this, "uninstallByKey", "There is no \"" + key + "\" plugin's key");
				}
				else {

					let that = this;
					return this.plugins[key].unload((data) ? data : null).then(function() {

						that.emit("unloaded", that.plugins[key]);
						return that.plugins[key].uninstall((data) ? data : null);

					}).then(function() {

						that.emit("uninstalled", that.plugins[key]);
						return fs.rmdirpProm(that.plugins[key].directory);

					}).then(function() {

						let name = that.plugins[key].name;
						that.plugins.splice(key, 1);

						return Promise.resolve(name);

					}).catch(function(err) {
						return _error(that, "uninstallByKey", err);
					});

				}

			}
			catch(e) {
				return _error(this, "uninstallByKey", e);
			}

		}

		uninstallByDirectory (dir, data) {

			try {

				let that = this;
				return fs.isDirectoryProm(dir).then(function(exists) {

					if (!exists) {
						return Promise.resolve(path.basename(dir));
					}
					else {

						let key = -1;

						for (let i = 0; i < that.plugins.length; ++i) {
							if (that.plugins[i].directory === dir) { key = i; break; }
						}

						if (-1 < key) {
							return that.uninstallByKey(key, (data) ? data : null);
						}
						else {

							return fs.rmdirpProm(dir).then(function() {
								return Promise.resolve(path.basename(dir));
							});

						}

					}

				}).catch(function(err) {
					return _error(that, "uninstallByDirectory", err);
				});

			}
			catch(e) {
				return _error(this, "uninstallByDirectory", e);
			}

		}

		uninstall (plugin, data) {

			let that = this;
			return this.uninstallByDirectory(plugin.directory, (data) ? data : null).catch(function(err) {
				return _error(that, "uninstall", err);
			});

		}

};
