
"use strict";

// deps
	
const 	fs = require('simplefs'),
		path = require('path'),
		spawn = require('child_process').spawn;

// module

module.exports = class SimplePluginsManager extends require('events').EventEmitter {

	constructor (directory) {

		super();

		this.directory = (directory) ? directory : '';
		this.plugins = [];

	}

	loadAll (data) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if ('' == that.directory) {
					reject(that.constructor.name + "/loadAll : 'directory' is not defined.");
				}
				else if (!fs.dirExists(that.directory)) {
					reject(that.constructor.name + "/loadAll : '" + that.directory + "' does not exist.");
				}
				else {

					fs.readdir(that.directory, function (err, plugins) {

						if (err) {
							reject((err.message) ? err.message : err);
						}
						else {

							plugins.forEach(function(plugin) {

								that.loadOne(path.join(that.directory, plugin), data)
								.then(function(plugin) {
									that.emit('load', plugin);
								})
								.catch(function(msg) {
									that.emit('error', msg);
								});

							});

							resolve();

						}

					});

				}

			}
			catch(e) {
				reject(that.constructor.name + "/loadAll : " + ((e.message) ? e.message : e));
			}

		});

	}

	loadOne (pluginPath, data) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if (!fs.fileExists(path.join(pluginPath, 'package.json'))) {
					reject(that.constructor.name + "/loadOne : missing '" + path.join(pluginPath, 'package.json') + "' file.");
				}
				else {

					var _Plugin = require(pluginPath);

					if ('function'!== typeof _Plugin) {
						reject(that.constructor.name + "/loadOne : '" + pluginPath + "' is not a valid plugin.");
					}
					else {

						var oPlugin = new _Plugin();

						if (!oPlugin.directory) {
							oPlugin.directory = pluginPath;
						}
						if (!oPlugin.name) {
							oPlugin.name = path.basename(pluginPath);
						}

						that.plugins.push(oPlugin);

						if ('function' !== typeof oPlugin.run) {
							reject(that.constructor.name + "/loadOne : Plugin '" + oPlugin.name + "' has no 'run' method.");
						}
						else if ('function' !== typeof oPlugin.free) {
							reject(that.constructor.name + "/loadOne : Plugin '" + oPlugin.name + "' has no 'free' method.");
						}
						else {

							oPlugin.run(data);
							resolve(oPlugin);

						}

					}

				}

			}
			catch(e) {
				reject(that.constructor.name + "/loadOne : " + ((e.message) ? e.message : e));
			}

		});

	}

	addByGithub (url) {

		var that = this;

		return new Promise(function(resolve, reject) {

			var tabUrl, pluginPath, oSpawn, sResult;

			try {

				if (-1 == url.indexOf('github')) {
					reject(that.constructor.name + "/addByGithub : '" + url + "' is not a valid github url.");
				}
				else if (-1 == url.indexOf('https')) {
					reject(that.constructor.name + "/addByGithub : '" + url + "' is not a valid https url.");
				}
				else {

					tabUrl = url.split('/');

					pluginPath = path.join(that.directory, tabUrl[tabUrl.length - 1]);

					if (fs.dirExists(pluginPath)) {
						reject(that.constructor.name + "/addByGithub : '" + pluginPath + "' aldready exists.");
					}
					else {

						oSpawn = spawn(
							'git', [
								'-c', 'diff.mnemonicprefix=false', '-c', 'core.quotepath=false', 'clone', '--recursive',
								url, pluginPath
							]
						);

						oSpawn.stdout.on('data', function(data) {
							sResult += data;
						});

						oSpawn.stderr.on('data', function(err) {
							sResult += err;
						});

						oSpawn.on('close', function (code) {

							if (code) {
								reject(that.constructor.name + "/addByGithub : " + sResult);
							}
							else {

								that.loadOne(pluginPath).then(function(plugin) {
									that.emit('add', plugin);
									resolve(plugin);
								}).catch(reject);

							}
							
						});
					
					}

				}

			}
			catch(e) {
				reject(that.constructor.name + "/addByGithub : " + ((e.message) ? e.message : e));
			}

		});

	}

	getPluginsNames () {

		var result = [];

			this.plugins.forEach(function (plugin) {
				result.push(plugin.name);
			});

		return result;

	}

	remove (key) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if (!that.plugins[key]) {
					reject(that.constructor.name + "/remove : there is no '" + key + "' plugins' key.");
				}
				else {

					var sName = that.plugins[key].name, sDirectory = that.plugins[key].directory;

					if ('function' === typeof that.plugins[key].free) {
						that.plugins[key].free();
					}

					that.plugins.splice(key, 1);

					if (!fs.rmdirp(sDirectory)) {
						reject(that.constructor.name + "/remove : impossible to remove '" + sDirectory + "' directory.");
					}
					else {

						that.emit('remove', sName);
						resolve(sName);

					}

				}

			}
			catch(e) {
				reject(that.constructor.name + "/remove : " + ((e.message) ? e.message : e));
			}

		});

	}

}
