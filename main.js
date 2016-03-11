
"use strict";

// deps
	
const 	fs = require('simplefs'),
		path = require('path'),
		spawn = require('child_process').spawn,
		SimplePlugin = require(path.join(__dirname, 'simpleplugin.js'));

// private
	
function _executeGIT(params) {

	return new Promise(function(resolve, reject) {

		var oSpawn, sResult = '';

		try {

			if (-1 >= process.env.PATH.indexOf('Git') && -1 >= process.env.PATH.indexOf('git')) {
				reject("SimplePluginsManager/_executeGIT : 'git' is probably not registered in your PATH.");
			}
			else {

				oSpawn = spawn('git', params);

				oSpawn.stdout.on('data', function(data) {
					sResult += data;
				});

				oSpawn.stderr.on('data', function(err) {
					sResult += ((err.message) ? err.message : err);
				});

				oSpawn.on('error', function(err) {
					sResult += ((err.message) ? err.message : err);
				})

				.on('close', function (code) {

					if (code) {
						reject("SimplePluginsManager/_executeGIT : " + sResult);
					}
					else {
						resolve();
					}
					
				});
				
			}

		}
		catch(e) {
			reject("SimplePluginsManager/_executeGIT : " + ((e.message) ? e.message : e));
		}

	});

}

function _createPluginByDirectory(dir) {

	return new Promise(function(resolve, reject) {

		try {

			if (!fs.dirExists(dir)) {
				reject("'" + dir + "' does not exist");
			}
			else if (!path.isAbsolute(dir)) {
				reject("'" + dir + "' is not an absolute path");
			}
			else {

				var _Plugin = require(dir), oPlugin;

				if ('function' !== typeof _Plugin) {
					reject("'" + dir + "' is not a function");
				}
				else {

					oPlugin = new _Plugin();
					oPlugin.directory = dir;
					oPlugin.name = path.basename(dir);

					if (!(oPlugin instanceof SimplePlugin)) {
						reject("'" + dir + "' is not a SimplePlugin class");
					}
					else {

						try {
							resolve(oPlugin.loadDataFromPackageFile());
						}
						catch(e) {
							reject((e.message) ? e.message : e);
						}

					}

				}

			}

		}
		catch(e) {
			reject((e.message) ? e.message : e);
		}

	});

}

// module

module.exports = class SimplePluginsManager extends require('events').EventEmitter {

	constructor (directory) {

		super();

		this.directory = (directory) ? directory : path.join(__dirname, 'plugins');
		this.plugins = [];

	}

	// getters

		static get SimplePlugin() { return SimplePlugin; }

		getPluginsNames () {

			var result = [];

				this.plugins.forEach(function (plugin) {
					result.push(plugin.name);
				});

			return result;

		}

	// load

		loadByDirectory (dir, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					_createPluginByDirectory(dir).then(function(plugin) {

						plugin.load((data) ? data : null);
						that.emit('loaded', plugin);
						that.plugins.push(plugin);

						resolve(plugin);

					})
					.catch(function(err) {

						that.emit('error', "SimplePluginsManager/loadByDirectory : '" + ((err.message) ? err.message : err));

						that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
							reject("SimplePluginsManager/loadByDirectory : " + err);
						})
						.catch(function(_err) {
							reject("SimplePluginsManager/loadByDirectory : " + err + ", " + _err);
						});

					});

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/loadByDirectory : '" + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/loadByDirectory : " + ((e.message) ? e.message : e));
				}

			});

		}

		loadAll (data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if ('' == that.directory) {
						that.emit('error', "SimplePluginsManager/loadAll : 'directory' is not defined.");
						reject("SimplePluginsManager/loadAll : 'directory' is not defined.");
					}
					else if (!fs.dirExists(that.directory)) {
						that.emit('error', "SimplePluginsManager/loadAll : '" + that.directory + "' does not exist.");
						reject("SimplePluginsManager/loadAll : '" + that.directory + "' does not exist.");
					}
					else if (!path.isAbsolute(that.directory)) {
						that.emit('error', "SimplePluginsManager/loadAll : '" + that.directory + "' is not an absolute path.");
						reject("SimplePluginsManager/loadAll : '" + that.directory + "' is not an absolute path.");
					}
					else {

						fs.readdir(that.directory, function (err, directories) {

							if (err) {
								that.emit('error', "SimplePluginsManager/loadAll : '" + ((err.message) ? err.message : err));
								reject("SimplePluginsManager/loadAll : '" + ((err.message) ? err.message : err));
							}
							else {

								directories.forEach(function(dir) {
									that.loadByDirectory(path.join(that.directory, dir), (data) ? data : null);
								});

								resolve();

							}

						});

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/loadAll : '" + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/loadAll : " + ((e.message) ? e.message : e));
				}

			});

		}

	// write

		// add

		installViaGithub (url, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (-1 == url.indexOf('github')) {
						that.emit('error', "SimplePluginsManager/installViaGithub : '" + url + "' is not a valid github url.");
						reject("SimplePluginsManager/installViaGithub : '" + url + "' is not a valid github url.");
					}
					else if (-1 == url.indexOf('https')) {
						that.emit('error', "SimplePluginsManager/installViaGithub : '" + url + "' is not a valid https url.");
						reject("SimplePluginsManager/installViaGithub : '" + url + "' is not a valid https url.");
					}
					else {

						var tabUrl = url.split('/'), dir = path.join(that.directory, tabUrl[tabUrl.length - 1]);

						if (fs.dirExists(dir)) {
							that.emit('error', "SimplePluginsManager/installViaGithub : '" + dir + "' aldready exists.");
							reject("SimplePluginsManager/installViaGithub : '" + dir + "' aldready exists.");
						}
						else {

							_executeGIT([
								'-c', 'core.quotepath=false', 'clone', '--recursive', '--depth=1',
								url, dir
							]).then(function() {

								_createPluginByDirectory(dir).then(function(plugin) {

									plugin.install((data) ? data : null);
									that.emit('installed', plugin);

									plugin.load((data) ? data : null);
									that.emit('loaded', plugin);

									that.plugins.push(plugin);

									resolve(plugin);

								})
								.catch(function(err) {

									that.emit('error', "SimplePluginsManager/installViaGithub : '" + err);

									that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
										reject("SimplePluginsManager/installViaGithub : '" + err);
									})
									.catch(function(_err) {
										reject("SimplePluginsManager/installViaGithub : " + err + ", " + _err);
									});

								});

							}).catch(function(err) {
								that.emit('error', "SimplePluginsManager/installViaGithub : " + err);
								reject("SimplePluginsManager/installViaGithub : " + err);
							});

						}

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/installViaGithub : " + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/installViaGithub : " + ((e.message) ? e.message : e));
				}

			});

		}

		// update

		updateByKey (key, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!that.plugins[key]) {
						that.emit('error', "SimplePluginsManager/updateByKey : there is no '" + key + "' plugins' key.");
						reject("SimplePluginsManager/updateByKey : there is no '" + key + "' plugins' key.");
					}
					else if (!that.plugins[key].github) {
						that.emit('error', "SimplePluginsManager/updateByKey : there is no known way to update this plugin.");
						reject("SimplePluginsManager/updateByKey : there is no known way to update this plugin.");
					}
					else {

						var dir = that.plugins[key].directory;

						that.plugins[key].unload((data) ? data : null, false);
						that.emit('unloaded', that.plugins[key]);

						that.plugins.splice(key, 1);

						_executeGIT([ '-c', dir, 'pull' ]).then(function() {

							_createPluginByDirectory(dir).then(function(plugin) {

								plugin.update((data) ? data : null);
								that.emit('updated', plugin);

								plugin.load((data) ? data : null);
								that.emit('loaded', plugin);

								that.plugins.push(plugin);

								resolve(plugin);

							})
							.catch(function(err) {
								
								that.emit('error', "SimplePluginsManager/updateByKey : '" + err);

								that.uninstallByDirectory(dir, (data) ? data : null).then(function() {
									reject("SimplePluginsManager/updateByKey : '" + err);
								})
								.catch(function(_err) {
									reject("SimplePluginsManager/updateByKey : " + err + ", " + _err);
								});

							});

						}).catch(function(err) {
							that.emit('error', "SimplePluginsManager/updateByKey : " + err);
							reject("SimplePluginsManager/updateByKey : " + err);
						});

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/updateByKey : " + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/updateByKey : " + ((e.message) ? e.message : e));
				}

			});

		}

		updateByDirectory (dir, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!fs.dirExists(dir)) {
						that.emit('error', "SimplePluginsManager/updateByDirectory : there is no '" + dir + "' plugins' directory.");
						reject("SimplePluginsManager/updateByDirectory : there is no '" + dir + "' plugins' directory.");
					}
					else {

						var key = -1;

						for (var i = 0; i < that.plugins.length; ++i) {
							if (that.plugins[i].directory === dir) { key = i; break; }
						}

						if (-1 < key) {
							that.updateByKey(key, (data) ? data : null).then(resolve).catch(reject);
						}
						else {
							that.emit('error', "SimplePluginsManager/updateByDirectory : impossible to find '" + dir + "' directory.");
							reject("SimplePluginsManager/updateByDirectory : impossible to find '" + dir + "' directory.");
						}

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/updateByDirectory : " + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/updateByDirectory : " + ((e.message) ? e.message : e));
				}

			});

		}

		update (plugin, data) {
			return this.updateByDirectory(plugin.directory, (data) ? data : null);
		}

		// uninstall

		uninstallByKey (key, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!that.plugins[key]) {
						that.emit('error', "SimplePluginsManager/uninstallByKey : there is no '" + key + "' plugins' key.");
						reject("SimplePluginsManager/uninstallByKey : there is no '" + key + "' plugins' key.");
					}
					else {

						that.plugins[key].unload((data) ? data : null);
						that.emit('unloaded', that.plugins[key]);

						that.plugins[key].uninstall((data) ? data : null);
						that.emit('uninstalled', that.plugins[key]);

						if (!fs.rmdirp(that.plugins[key].directory)) {
							that.emit('error', "SimplePluginsManager/uninstallByKey : impossible to remove '" + that.plugins[key].directory + "' directory.");
							reject("SimplePluginsManager/uninstallByKey : impossible to remove '" + that.plugins[key].directory + "' directory.");
						}
						else {

							var name = that.plugins[key].name;
							that.plugins.splice(key, 1);
							resolve(name);

						}

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/uninstallByKey : " + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/uninstallByKey : " + ((e.message) ? e.message : e));
				}

			});

		}

		uninstallByDirectory (dir, data) {

			var that = this;

			return new Promise(function(resolve, reject) {

				try {

					if (!fs.dirExists(dir)) {
						that.emit('error', "SimplePluginsManager/uninstallByDirectory : there is no '" + dir + "' plugins' directory.");
						reject("SimplePluginsManager/uninstallByDirectory : there is no '" + dir + "' plugins' directory.");
					}
					else {

						var key = -1;

						for (var i = 0; i < that.plugins.length; ++i) {
							if (that.plugins[i].directory === dir) { key = i; break; }
						}

						if (-1 < key) {
							that.uninstallByKey(key, (data) ? data : null).then(resolve).catch(reject);
						}
						else {
							
							if (!fs.rmdirp(dir)) {
								that.emit('error', "SimplePluginsManager/uninstallByDirectory : impossible to remove '" + dir + "' directory.");
								reject("SimplePluginsManager/uninstallByDirectory : impossible to remove '" + dir + "' directory.");
							}
							else {
								resolve(path.basename(dir));
							}

						}

					}

				}
				catch(e) {
					that.emit('error', "SimplePluginsManager/uninstallByDirectory : " + ((e.message) ? e.message : e));
					reject("SimplePluginsManager/uninstallByDirectory : " + ((e.message) ? e.message : e));
				}

			});

		}

		uninstall (plugin, data) {
			return this.uninstallByDirectory(plugin.directory, (data) ? data : null);
		}

}
