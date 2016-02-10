
"use strict";

// deps
	
const 	fs = require('simplefs'),
		path = require('path'),
		spawn = require('child_process').spawn,
		SimplePugin = require('simpleplugin');

// module

module.exports = class SimplePluginsManager extends require('events').EventEmitter {

	constructor (directory) {

		super();

		this.directory = (directory) ? directory : path.join(__dirname, 'plugins');
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

			var oPlugin;

			try {

				oPlugin = new SimplePugin();
				oPlugin.directory = pluginPath;
				oPlugin.name = path.basename(pluginPath);

				if (!fs.fileExists(path.join(pluginPath, 'package.json'))) {
					that.plugins.push(oPlugin);
					reject(that.constructor.name + "/loadOne : missing '" + path.join(pluginPath, 'package.json') + "' file.");
				}
				else {

					var _Plugin = require(pluginPath);

					if ('function'!== typeof _Plugin) {
						that.plugins.push(oPlugin);
						reject(that.constructor.name + "/loadOne : '" + pluginPath + "' is not a valid plugin.");
					}
					else {

						oPlugin = new _Plugin();

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
				reject(that.constructor.name + "/loadOne : Plugin '" + pluginPath + "' -> " + ((e.message) ? e.message : e));
			}

		});

	}

	addByGithub (url, data) {

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

								that.loadOne(pluginPath, data).then(function(plugin) {
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

	removeByKey (key, data) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if (!that.plugins[key]) {
					reject(that.constructor.name + "/removeByKey : there is no '" + key + "' plugins' key.");
				}
				else {

					var sName = that.plugins[key].name, sDirectory = that.plugins[key].directory;

					if ('function' === typeof that.plugins[key].free) {
						that.plugins[key].free(data);
					}

					that.plugins.splice(key, 1);

					if (!fs.rmdirp(sDirectory)) {
						reject(that.constructor.name + "/removeByKey : impossible to remove '" + sDirectory + "' directory.");
					}
					else {

						that.emit('remove', sName);
						resolve(sName);

					}

				}

			}
			catch(e) {
				reject(that.constructor.name + "/removeByKey : " + ((e.message) ? e.message : e));
			}

		});

	}

	removeByDirectory (dir, data) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if (!fs.dirExists(dir)) {
					reject(that.constructor.name + "/removeByDirectory : there is no '" + dir + "' plugins' directory.");
				}
				else {

					var key = 0;

					for (var i = 0; i < that.plugins.length; ++i) {

						if (that.plugins[i].directory === dir) {
							key = i;
							break;
						}

					}

					if (0 >= key) {
						reject(that.constructor.name + "/removeByDirectory : impossible to remove '" + dir + "' directory.");
					}
					else {
						that.removeByKey(key, data).then(resolve).catch(reject);
					}

				}

			}
			catch(e) {
				reject(that.constructor.name + "/removeByDirectory : " + ((e.message) ? e.message : e));
			}

		});

	}

}
