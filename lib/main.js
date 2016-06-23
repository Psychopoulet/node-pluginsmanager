
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
			return Promise.reject("PluginsManager/_executeGIT : \"git\" is probably not registered in your PATH.");
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
							reject("PluginsManager/_executeGIT : " + sResult);
						}
						else {
							resolve();
						}
						
					});

			});
			
		}
		
	}
	catch(e) {
		return Promise.reject("PluginsManager/_executeGIT : " + ((e.message) ? e.message : e));
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
		return Promise.reject("PluginsManager/_createPluginByDirectory : " + ((e.message) ? e.message : e));
	}

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

					if (plugin) {
						err = "PluginsManager/loadByDirectory/" + plugin.name + " : " + err;
					}
					else {
						err = "PluginsManager/loadByDirectory : " + err;
					}

					that.emit("error", err);
					return Promise.reject(err);

				});

			}
			catch(e) {
				this.emit("error", "PluginsManager/loadByDirectory : " + ((e.message) ? e.message : e));
				return Promise.reject("PluginsManager/loadByDirectory : " + ((e.message) ? e.message : e));
			}

		}

		loadAll (data) {

			try {

				if ("" == this.directory) {
					this.emit("error", "PluginsManager/loadAll : \"directory\" is not defined.");
					return Promise.reject("PluginsManager/loadAll : \"directory\" is not defined.");
				}
				else {

					let that = this;
					return fs.isDirectoryProm(this.directory).then(function(exists) {

						if (!exists) {
							that.emit("error", "PluginsManager/loadAll : \"" + that.directory + "\" does not exist.");
							return Promise.reject("PluginsManager/loadAll : \"" + that.directory + "\" does not exist.");
						}
						else if (!path.isAbsolute(that.directory)) {
							that.emit("error", "PluginsManager/loadAll : \"" + that.directory + "\" is not an absolute path.");
							return Promise.reject("PluginsManager/loadAll : \"" + that.directory + "\" is not an absolute path.");
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

							}).catch(function(err) {
								that.emit("error", "PluginsManager/loadAll : " + ((err.message) ? err.message : err));
								return Promise.reject("PluginsManager/loadAll : " + ((err.message) ? err.message : err));
							});

						}

					}).catch(function(err) {
						that.emit("error", "PluginsManager/loadAll : impossible to load all \"" + that.directory + "\" directory : " + err + ".");
						return Promise.reject("PluginsManager/loadAll : impossible to load all \"" + that.directory + "\" directory : " + err + ".");
					});

				}

			}
			catch(e) {
				this.emit("error", "PluginsManager/loadAll : " + ((e.message) ? e.message : e));
				return Promise.reject("PluginsManager/loadAll : " + ((e.message) ? e.message : e));
			}

		}

	// write

		// add

		installViaGithub (url, data) {

			try {

				if (-1 == url.indexOf("github")) {
					this.emit("error", "PluginsManager/installViaGithub : \"" + url + "\" is not a valid github url.");
					return Promise.reject("PluginsManager/installViaGithub : \"" + url + "\" is not a valid github url.");
				}
				else if (-1 == url.indexOf("https")) {
					this.emit("error", "PluginsManager/installViaGithub : \"" + url + "\" is not a valid https url.");
					return Promise.reject("PluginsManager/installViaGithub : \"" + url + "\" is not a valid https url.");
				}
				else {

					let tabUrl = url.split("/"), dir = path.join(that.directory, tabUrl[tabUrl.length - 1]);

					let that = this;
					return fs.isDirectoryProm(dir).then(function(exists) {

						if (exists) {
							that.emit("error", "PluginsManager/installViaGithub : \"" + dir + "\" aldready exists.");
							return Promise.reject("PluginsManager/installViaGithub : \"" + dir + "\" aldready exists.");
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

								that.emit("error", "PluginsManager/installViaGithub : impossible to install \"" + dir + "\" directory : " + err + ".");

								return that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
									return Promise.reject("PluginsManager/installViaGithub : impossible to install \"" + dir + "\" directory : " + err);
								}).catch(function(_err) {
									return Promise.reject("PluginsManager/installViaGithub : impossible to install \"" + dir + "\" directory : " + err + ", " + _err);
								});

							});

						}

					}).catch(function(err) {
						that.emit("error", "PluginsManager/installViaGithub : impossible to install \"" + dir + "\" directory : " + err + ".");
						return Promise.reject("PluginsManager/installViaGithub : impossible to install \"" + dir + "\" directory : " + err);
					});

				}

			}
			catch(e) {
				this.emit("error", "PluginsManager/installViaGithub : " + ((e.message) ? e.message : e));
				return Promise.reject("PluginsManager/installViaGithub : " + ((e.message) ? e.message : e));
			}

		}

		// update

		updateByKey (key, data) {

			let that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!that.plugins[key]) {
						that.emit("error", "PluginsManager/updateByKey : there is no \"" + key + "\" plugin's key.");
						reject("PluginsManager/updateByKey : there is no \"" + key + "\" plugin's key.");
					}
					else if (!that.plugins[key].github) {
						that.emit("error", "PluginsManager/updateByKey : there is no known way to update this plugin.");
						reject("PluginsManager/updateByKey : there is no known way to update this plugin.");
					}
					else {

						let dir = that.plugins[key].directory, plugin;

						that.plugins[key].unload((data) ? data : null, false).then(function() {

							that.emit("unloaded", that.plugins[key]);
							that.plugins.splice(key, 1);

							_executeGIT([ "-c", dir, "pull" ]).then(function() {
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
								resolve(plugin);

							}).catch(function(err) {

								that.emit("error", "PluginsManager/updateByKey : " + err);

								that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
									reject("PluginsManager/updateByKey : " + err);
								}).catch(function(_err) {
									reject("PluginsManager/updateByKey : " + err + ", " + _err);
								});

							});

						}).catch(function(err) {
							that.emit("error", "PluginsManager/updateByKey : " + err);
							reject("PluginsManager/updateByKey : " + err);
						});

					}

				}
				catch(e) {
					that.emit("error", "PluginsManager/updateByKey : " + ((e.message) ? e.message : e));
					reject("PluginsManager/updateByKey : " + ((e.message) ? e.message : e));
				}

			});

		}

		updateByDirectory (dir, data) {

			let that = this;

			return new Promise(function(resolve, reject) {

				try {

					fs.isDirectoryProm(dir).then(function(exists) {

						if (!exists) {
							that.emit("error", "PluginsManager/updateByDirectory : there is no \"" + dir + "\" plugins' directory.");
							reject("PluginsManager/updateByDirectory : there is no \"" + dir + "\" plugins' directory.");
						}
						else {

							let key = -1;

							for (let i = 0; i < that.plugins.length; ++i) {
								if (that.plugins[i].directory === dir) { key = i; break; }
							}

							if (-1 < key) {
								that.updateByKey(key, (data) ? data : null).then(resolve).catch(reject);
							}
							else {
								that.emit("error", "PluginsManager/updateByDirectory : impossible to find \"" + dir + "\" directory.");
								reject("PluginsManager/updateByDirectory : impossible to find \"" + dir + "\" directory.");
							}

						}

					}).catch(function(err) {
						that.emit("error", "PluginsManager/updateByDirectory : impossible to update \"" + dir + "\" directory : " + err + ".");
						reject("PluginsManager/updateByDirectory : impossible to update \"" + dir + "\" directory : " + err + ".");
					});

				}
				catch(e) {
					that.emit("error", "PluginsManager/updateByDirectory : " + ((e.message) ? e.message : e));
					reject("PluginsManager/updateByDirectory : " + ((e.message) ? e.message : e));
				}

			});

		}

		update (plugin, data) {
			return this.updateByDirectory(plugin.directory, (data) ? data : null);
		}

		// uninstall

		uninstallByKey (key, data) {

			let that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!that.plugins[key]) {
						that.emit("error", "PluginsManager/uninstallByKey : there is no \"" + key + "\" plugin's key.");
						reject("PluginsManager/uninstallByKey : there is no \"" + key + "\" plugin's key.");
					}
					else {

						that.plugins[key].unload((data) ? data : null).then(function() {

							that.emit("unloaded", that.plugins[key]);
							return that.plugins[key].uninstall((data) ? data : null);

						}).then(function() {

							that.emit("uninstalled", that.plugins[key]);
							return fs.rmdirpProm(that.plugins[key].directory);

						}).then(function() {

							let name = that.plugins[key].name;
							that.plugins.splice(key, 1);

							resolve(name);

						}).catch(function(err) {
							that.emit("error", "PluginsManager/uninstallByKey : impossible to remove \"" + that.plugins[key].directory + "\" directory : " + err + ".");
							reject("PluginsManager/uninstallByKey : impossible to remove \"" + that.plugins[key].directory + "\" directory : " + err + ".");
						});

					}

				}
				catch(e) {
					that.emit("error", "PluginsManager/uninstallByKey : " + ((e.message) ? e.message : e));
					reject("PluginsManager/uninstallByKey : " + ((e.message) ? e.message : e));
				}

			});

		}

		uninstallByDirectory (dir, data) {

			let that = this;

			return new Promise(function(resolve, reject) {

				try {

					fs.isDirectoryProm(dir).then(function(exists) {

						if (!exists) {
							resolve(path.basename(dir));
						}
						else {

							let key = -1;

							for (let i = 0; i < that.plugins.length; ++i) {
								if (that.plugins[i].directory === dir) { key = i; break; }
							}

							if (-1 < key) {
								that.uninstallByKey(key, (data) ? data : null).then(resolve).catch(reject);
							}
							else {

								fs.rmdirpProm(dir).then(function() {
									resolve(path.basename(dir));
								}).catch(function(err) {
									that.emit("error", "PluginsManager/uninstallByDirectory : impossible to remove \"" + dir + "\" directory : " + err + ".");
									reject("PluginsManager/uninstallByDirectory : impossible to remove \"" + dir + "\" directory : " + err + ".");
								});

							}

						}

					}).catch(function(err) {
						that.emit("error", "PluginsManager/uninstallByDirectory : impossible to remove \"" + dir + "\" directory : " + err + ".");
						reject("PluginsManager/uninstallByDirectory : impossible to remove \"" + dir + "\" directory : " + err + ".");
					});

				}
				catch(e) {
					that.emit("error", "PluginsManager/uninstallByDirectory : " + ((e.message) ? e.message : e));
					reject("PluginsManager/uninstallByDirectory : " + ((e.message) ? e.message : e));
				}

			});

		}

		uninstall (plugin, data) {
			return this.uninstallByDirectory(plugin.directory, (data) ? data : null);
		}

};
