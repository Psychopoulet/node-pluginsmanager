
"use strict";

// deps
	
const 	fs = require('simplefs'),
		path = require('path'),
		spawn = require('child_process').spawn;

// private

function _deleteFolderRecursive(path) {

	if(fs.existsSync(path) ) {

		fs.readdirSync(path).forEach(function(file,index) {

			var curPath = path + "/" + file;

			if(fs.dirExists(curPath)) {
				_deleteFolderRecursive(curPath);
			}
			else {
				fs.unlinkSync(curPath);
			}

		});

		fs.rmdirSync(path);

	}

}

// module

module.exports = class SimplePluginsManager {

	constructor () {

		this.directory = '';
		this.plugins = [];

	}

	load () {

		var that = this;

		return new Promise(function(resolve, reject) {

			if ('' == that.directory) {
				reject(that.constructor.name + "/load : 'directory' is not defined.");
			}
			else if (!fs.dirExists(that.directory)) {
				reject(that.constructor.name + "/load : '" + that.directory + "' does not exist.");
			}
			else {

				fs.readdir(that.directory, function (err, plugins) {

					if (err) {
						reject((err.message) ? err.message : err);
					}
					else {

						err = null;

						for (var i = 0; i < plugins.length; ++i) {

							try {

								if (fs.fileExists(path.join(that.directory, plugins[i], 'package.json'))) {
									that.addByPath(path.join(that.directory, plugins[i]));
								}
								
							}
							catch(e) {
								err = (e.message) ? e.message : e;
								break;
							}

						}

						if (err) {
							reject(err);
						}
						else {
							resolve();
						}

					}

				});

			}

		});

	}

	addByPath (pluginPath) {

		var _Plugin, oPlugin;

		try {

			_Plugin = require(pluginPath);
			oPlugin = new _Plugin();

			if ('function' !== typeof oPlugin.run) {
				throw "Plugin '" + oPlugin.name + "' has no 'run' method.";
			}
			else {

				for (var j = 0; j < this.plugins.length; ++j) {

					if (oPlugin.name == this.plugins[j].name) {
						throw "Plugin's name '" + oPlugin.name + "' is already used.";
					}

				}

				oPlugin.run();
				this.plugins.push(oPlugin);
				
			}

		}
		catch(e) {
			_deleteFolderRecursive(pluginPath);
			throw this.constructor.name + "/addByPath : " + ((e.message) ? e.message : e);
		}

		return oPlugin;

	}

	addByGithub (url) {

		var that = this;

		return new Promise(function(resolve, reject) {

			var tabUrl, pluginPath, oSpawn, sResult;

			try {

				if (-1 == url.indexOf('github')) {
					reject(that.constructor.name + "/addByGithub : '" + url + "' is not a valid github url.");
				}
				else {

					tabUrl = url.split('/');

					pluginPath = path.join(that.directory, tabUrl[tabUrl.length - 1]);

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

							try {

								if (fs.fileExists(path.join(pluginPath, 'package.json'))) {
									resolve(that.addByPath(pluginPath));
								}
								else {
									reject("'" + path.join(pluginPath, 'package.json') + "' does not exist.");
								}
								
							}
							catch(e) {
								reject(e);
							}
							
						}
						
					});
					
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

		if (!this.plugins[key]) {
			throw this.constructor.name + "/remove : there is no '" + key + "' plugins' key.";
		}
		else {

			try {
				this.plugins[key].free();
				this.plugins.splice(key, 1);
			}
			catch(e) { }

		}

	}

}
