
"use strict";

// deps

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require("path");

var _require = require("child_process"),
    exec = _require.exec,
    spawn = _require.spawn;

var fs = require("node-promfs");
var Plugin = require(path.join(__dirname, "plugin.js"));

// module

module.exports = function (_require2) {
	_inherits(PluginsManager, _require2);

	function PluginsManager(directory) {
		_classCallCheck(this, PluginsManager);

		// private

		var _this = _possibleConstructorReturn(this, (PluginsManager.__proto__ || Object.getPrototypeOf(PluginsManager)).call(this));

		_this._beforeLoadAll = null;
		_this._orderedDirectoriesBaseNames = [];
		_this._maxListeners = 0;

		// public

		_this.directory = directory && "string" === typeof directory ? directory : path.join(__dirname, "plugins");
		_this.plugins = [];

		return _this;
	}

	// private

	/**
 * Generate a Plugin object by its directory
 * @param {string} directory : plugin's directory
 * @returns {object} Promise
 */


	_createClass(PluginsManager, [{
		key: "_createPluginByDirectory",
		value: function _createPluginByDirectory(directory) {

			return fs.isDirectoryProm(directory).then(function (exists) {
				return exists ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" does not exist"));
			}).then(function () {
				return path.isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" is not an absolute path"));
			}).then(function () {

				var _Plugin = require(directory);
				var oPlugin = null;

				return Promise.resolve().then(function () {

					return "function" !== typeof _Plugin ? Promise.reject(new Error("\"" + directory + "\" is not a function")) : Promise.resolve();
				}).then(function () {

					oPlugin = new _Plugin();
					oPlugin.directory = directory;
					oPlugin.name = path.basename(directory);

					return !(oPlugin instanceof Plugin) ? Promise.reject(new Error("\"" + path.basename(directory) + "\" is not a plugin class")) : oPlugin.loadDataFromPackageFile();
				});
			});
		}

		/**
  * Return the plugin's key by its directory
  * @param {string} directory : plugin's directory
  * @returns {number} key
  */

	}, {
		key: "_directoryToKey",
		value: function _directoryToKey(directory) {

			var result = -1;

			for (var i = 0; i < this.plugins.length; ++i) {

				if (this.plugins[i].directory === directory) {
					result = i;break;
				}
			}

			return result;
		}

		/**
  * Enforce generic actions on error
  * @param {string} fnName : function name
  * @param {string} err : error's message
  * @returns {object} Promise
  */

	}, {
		key: "_error",
		value: function _error(fnName, err) {

			this.emit("error", fnName + " : " + this._stdToString(err));
			return Promise.reject(err);
		}

		/**
  * Execute GIT command
  * @param {Array} params : parameters
  * @returns {object} Promise
  */

	}, {
		key: "_GIT",
		value: function _GIT(params) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				var result = "";
				var mySpawn = spawn("git", params).on("error", function (msg) {
					result += _this2._stdToString(msg);
				}).on("close", function (code) {
					return code ? reject(new Error(result)) : resolve();
				});

				mySpawn.stdout.on("data", function (msg) {
					result += _this2._stdToString(msg);
				});

				mySpawn.stderr.on("data", function (msg) {
					result += _this2._stdToString(msg);
				});
			});
		}

		/**
  * Use for but ordered loading
  * @param {number} i : plugin's key
  * @param {object|Array|null} data : passed to plugin's "load" method
  * @returns {object} Promise
  */

	}, {
		key: "_loadOrderedNext",
		value: function _loadOrderedNext(i, data) {
			var _this3 = this;

			if (i >= this._orderedDirectoriesBaseNames.length) {
				return Promise.resolve();
			} else {

				return this.loadByDirectory(path.join(this.directory, this._orderedDirectoriesBaseNames[i]), data).then(function () {
					return _this3._loadOrderedNext(i + 1, data);
				});
			}
		}

		/**
  * Execute NPM command
  * @param {string} directory : plugin's directory
  * @param {string} command : parameters
  * @returns {object} Promise
  */

	}, {
		key: "_NPM",
		value: function _NPM(directory, command) {
			var _this4 = this;

			return fs.mkdirpProm(directory).then(function () {

				return new Promise(function (resolve, reject) {

					exec("npm " + command, {
						"cwd": directory
					}, function (err, stdout, stderr) {
						return err ? reject(new Error(_this4._stdToString(stderr))) : resolve();
					});
				});
			});
		}

		/**
  * Formate std out|err to string
  * @param {Buffer|string} msg : std out|err
  * @returns {string} result
  */

	}, {
		key: "_stdToString",
		value: function _stdToString(msg) {

			if ("object" !== (typeof msg === "undefined" ? "undefined" : _typeof(msg))) {
				return String(msg);
			} else if (msg instanceof Buffer) {
				return msg.toString("utf8");
			} else {
				return msg.message ? msg.message : String(msg);
			}
		}

		/**
  * Use for unloading
  * @param {object|Array|null} data : passed to plugin's "load" method
  * @returns {object} Promise
  */

	}, {
		key: "_unloadNext",
		value: function _unloadNext(data) {

			return 0 >= this.plugins.length ? Promise.resolve() : this.unloadByKey(this.plugins.length - 1, data);
		}

		// public

		// getters

	}, {
		key: "getPluginsNames",
		value: function getPluginsNames() {

			var result = [];

			this.plugins.forEach(function (plugin) {
				result.push(plugin.name);
			});

			return result;
		}

		// setters

	}, {
		key: "setOrder",
		value: function setOrder(pluginsDirectoriesBaseNames) {
			var _this5 = this;

			return Promise.resolve().then(function () {

				return "object" !== (typeof pluginsDirectoriesBaseNames === "undefined" ? "undefined" : _typeof(pluginsDirectoriesBaseNames)) || !(pluginsDirectoriesBaseNames instanceof Array) ? Promise.reject(new Error("This is not an array")) : Promise.resolve();
			}).then(function () {

				var errors = [];
				for (var i = 0; i < pluginsDirectoriesBaseNames.length; ++i) {

					if ("string" !== typeof pluginsDirectoriesBaseNames[i]) {
						errors.push("The directory at index \"" + i + "\" must be a string");
					} else if ("" === pluginsDirectoriesBaseNames[i].trim()) {
						errors.push("The directory at index \"" + i + "\" must be not empty");
					}
				}

				return !errors.length ? Promise.resolve() : Promise.reject(new Error(errors.join("\r\n")));
			}).then(function () {
				_this5._orderedDirectoriesBaseNames = pluginsDirectoriesBaseNames;
				return Promise.resolve();
			});
		}

		// inherited

	}, {
		key: "emit",
		value: function emit(eventName, eventData) {

			if (0 < this.listenerCount(eventName)) {
				_get(PluginsManager.prototype.__proto__ || Object.getPrototypeOf(PluginsManager.prototype), "emit", this).call(this, eventName, eventData ? eventData : null);
			}
		}

		// load / unload

	}, {
		key: "beforeLoadAll",
		value: function beforeLoadAll(callback) {
			var _this6 = this;

			return Promise.resolve().then(function () {

				return "function" !== typeof callback ? Promise.reject(new Error("This is not a function")) : Promise.resolve();
			}).then(function () {
				_this6._beforeLoadAll = callback;
				return Promise.resolve();
			});
		}

		// load

	}, {
		key: "loadByDirectory",
		value: function loadByDirectory(directory, data) {
			var _this7 = this;

			return Promise.resolve().then(function () {

				return "string" !== typeof directory ? Promise.reject(new Error("\"directory\" parameter is not a string")) : Promise.resolve();
			}).then(function () {

				// is already loaded ?
				var plugin = null;
				for (var i = 0; i < _this7.plugins.length; ++i) {

					if (directory === _this7.plugins[i].directory) {
						plugin = _this7.plugins[i];
						break;
					}
				}

				// is already exists ?
				return plugin ? Promise.resolve(plugin) : fs.isDirectoryProm(directory).then(function (exists) {

					return !exists ? Promise.resolve() : _this7._createPluginByDirectory(directory).then(function (_plugin) {

						// load

						plugin = _plugin;
						return plugin.load(data);
					}).then(function () {

						_this7.emit("loaded", plugin);
						_this7.plugins.push(plugin);

						return Promise.resolve(plugin);
					}).catch(function (err) {

						return Promise.reject(new Error("\"" + (plugin ? plugin.name : path.basename(directory)) + "\" => " + (err.message ? err.message : err))).catch(function (_err) {
							return _this7._error("loadByDirectory", _err);
						});
					});
				});
			});
		}
	}, {
		key: "loadAll",
		value: function loadAll(data) {
			var _this8 = this;

			return Promise.resolve().then(function () {

				return "" === _this8.directory ? Promise.reject(new Error("\"directory\" is not defined")) : Promise.resolve();
			}).then(function () {

				// create dir if not exist
				return fs.mkdirpProm(_this8.directory).then(function () {

					// execute _beforeLoadAll
					return "function" !== typeof _this8._beforeLoadAll ? Promise.resolve() : new Promise(function (resolve, reject) {

						var fn = _this8._beforeLoadAll();

						if (!(fn instanceof Promise)) {
							reject(new Error("\"beforeLoadAll\" callback's return is not a Promise instance"));
						} else {
							fn.then(resolve).catch(reject);
						}
					});

					// load plugins
				}).then(function () {
					return fs.readdirProm(_this8.directory);
				}).then(function (files) {

					if (0 >= files.length) {
						_this8.emit("allloaded");
						return Promise.resolve();
					} else {

						return _this8._loadOrderedNext(0, data).then(function () {

							return new Promise(function (resolve) {

								var i = files.length;
								files.forEach(function (file) {

									_this8.loadByDirectory(path.join(_this8.directory, file), data).then(function () {

										i--;
										if (0 === i) {
											_this8.emit("allloaded");resolve();
										}
									}).catch(function () {

										i--;
										if (0 === i) {
											_this8.emit("allloaded");resolve();
										}
									});
								});
							});
						});
					}

					// sort plugins
				}).then(function () {

					for (var i = 0; i < _this8.plugins.length - 1; ++i) {

						for (var j = i + 1; j < _this8.plugins.length; ++j) {

							if (_this8.plugins[i].name > _this8.plugins[j].name) {

								var tmp = _this8.plugins[j];

								_this8.plugins[j] = _this8.plugins[i];
								_this8.plugins[i] = tmp;
							}
						}
					}

					return Promise.resolve();
				}).catch(function (err) {
					return _this8._error("loadAll", err);
				});
			});
		}

		// unload

	}, {
		key: "unloadByKey",
		value: function unloadByKey(key, data) {
			var _this9 = this;

			return Promise.resolve().then(function () {

				return "number" !== typeof key ? Promise.reject(new Error("\"key\" is not an integer")) : Promise.resolve();
			}).then(function () {

				return !_this9.plugins[key] ? Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) : Promise.resolve();
			}).then(function () {

				return _this9.plugins[key].unload(data).then(function () {

					_this9.emit("unloaded", _this9.plugins[key]);
					_this9.plugins.splice(key, 1);

					return Promise.resolve();
				}).catch(function (err) {
					return _this9._error("unloadByKey", err);
				});
			});
		}
	}, {
		key: "unloadByDirectory",
		value: function unloadByDirectory(directory, data) {
			var _this10 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				return !exists ? Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) : Promise.resolve();
			}).then(function () {

				var key = _this10._directoryToKey(directory);

				return -1 < key ? _this10.unloadByKey(key, data) : Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory"));
			});
		}
	}, {
		key: "unload",
		value: function unload(plugin, data) {

			return plugin && plugin.directory ? this.unloadByDirectory(plugin.directory, data) : Promise.reject(new Error("There is no plugin"));
		}
	}, {
		key: "unloadAll",
		value: function unloadAll(data) {
			var _this11 = this;

			return this._unloadNext(data).then(function () {
				_this11.emit("allunloaded");
				return Promise.resolve();
			});
		}

		// write

		// add

	}, {
		key: "installViaGithub",
		value: function installViaGithub(url, data) {
			var _this12 = this;

			return Promise.resolve().then(function () {

				return "string" !== typeof url ? Promise.reject(new Error("\"url\" is not a string")) : Promise.resolve();
			}).then(function () {

				var _url = url.trim();

				return Promise.resolve().then(function () {

					return "" === _url ? Promise.reject(new Error("\"url\" is empty")) : Promise.resolve();
				}).then(function () {

					return -1 >= _url.indexOf("github") ? Promise.reject(new Error("\"" + _url + "\" is not a valid github url")) : Promise.resolve();
				}).then(function () {

					return -1 >= _url.indexOf("https") ? Promise.reject(new Error("\"" + _url + "\" is not a valid https url")) : Promise.resolve();
				}).then(function () {

					var tabUrl = _url.split("/");
					var directory = path.join(_this12.directory, tabUrl[tabUrl.length - 1]);

					return fs.isDirectoryProm(directory).then(function (exists) {

						return exists ? Promise.reject(new Error("\"" + directory + "\" aldready exists")) : Promise.resolve();
					}).then(function () {

						// git clone
						return _this12._GIT(["-c", "core.quotepath=false", "clone", "--recursive", "--depth", "1", _url, directory

						// install dependencies & execute install script
						]).then(function () {
							return _this12._createPluginByDirectory(directory);
						}).then(function (plugin) {

							return Promise.resolve().then(function () {
								return !plugin.dependencies ? Promise.resolve() : _this12._NPM(directory, "install");
							}).then(function () {
								return plugin.install(data);

								// execute load script
							}).then(function () {

								_this12.emit("installed", plugin);
								return plugin.load(data);
							}).then(function () {

								_this12.emit("loaded", plugin);
								_this12.plugins.push(plugin);
								return Promise.resolve(plugin);
							});
						}).catch(function (err) {

							return _this12.uninstallByDirectory(directory, data).then(function () {

								return Promise.reject(new Error("Impossible to install \"" + _url + "\" plugin : " + err.message ? err.message : err));
							}).catch(function (_err) {
								return _this12._error("installViaGithub", _err);
							});
						});
					});
				});
			});
		}

		// update

	}, {
		key: "updateByKey",
		value: function updateByKey(key, data) {
			var _this13 = this;

			return Promise.resolve().then(function () {

				return "number" !== typeof key ? Promise.reject(new Error("\"key\" is not an integer")) : Promise.resolve();
			}).then(function () {

				return !_this13.plugins[key] ? Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) : Promise.resolve();
			}).then(function () {

				var plugin = _this13.plugins[key];
				return plugin.unload(data, false).then(function () {

					_this13.emit("unloaded", plugin);
					_this13.plugins.splice(key, 1);

					// download plugin
					return !plugin.github ? Promise.resolve() : _this13._GIT(["-c", plugin.directory, "pull"]);
				}).then(function () {
					return _this13._createPluginByDirectory(plugin.directory);
				}).then(function (_plugin) {

					// update dependencies & execute update script
					return Promise.resolve().then(function () {
						return !_plugin.dependencies ? Promise.resolve() : _this13._NPM(_plugin.directory, "update --prod");
					}).then(function () {
						return _plugin.update(data);
					}).then(function () {

						_this13.emit("updated", _plugin);
						return _plugin.load(data);

						// execute load script
					}).then(function () {

						_this13.emit("loaded", _plugin);
						_this13.plugins.push(_plugin);

						return Promise.resolve(_plugin);
					});

					// remove package-lock.json file
				}).then(function (_plugin) {

					var updateFile = path.join(_plugin.directory, "package-lock.json");

					return fs.isFileProm(updateFile).then(function (exists) {
						return !exists ? Promise.resolve() : fs.unlinkProm(updateFile);
					});
				}).catch(function (err) {
					return _this13._error("updateByKey", err);
				});
			});
		}
	}, {
		key: "updateByDirectory",
		value: function updateByDirectory(directory, data) {
			var _this14 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				return !exists ? Promise.reject(new Error("There is no \"" + directory + "\" plugin's directory")) : Promise.resolve();
			}).then(function () {

				var key = _this14._directoryToKey(directory);

				return Promise.resolve().then(function () {

					return -1 >= key ? Promise.reject(new Error("Impossible to find \"" + directory + "\" plugin's directory")) : Promise.resolve();
				}).then(function () {
					return _this14.updateByKey(key, data);
				});
			});
		}
	}, {
		key: "update",
		value: function update(plugin, data) {

			return plugin && plugin.directory ? this.updateByDirectory(plugin.directory, data) : Promise.reject(new Error("There is no plugin"));
		}

		// uninstall

	}, {
		key: "uninstallByKey",
		value: function uninstallByKey(key, data) {
			var _this15 = this;

			return Promise.resolve().then(function () {

				return "number" !== typeof key ? Promise.reject(new Error("\"key\" is not an integer")) : Promise.resolve();
			}).then(function () {

				return !_this15.plugins[key] ? Promise.reject(new Error("There is no \"" + key + "\" plugin's key")) : Promise.resolve();
			}).then(function () {

				return _this15.plugins[key].unload(data).then(function () {

					_this15.emit("unloaded", _this15.plugins[key]);
					return _this15.plugins[key].uninstall(data);
				}).then(function () {

					_this15.emit("uninstalled", _this15.plugins[key]);
					return fs.rmdirpProm(_this15.plugins[key].directory);
				}).then(function () {
					var name = _this15.plugins[key].name;

					_this15.plugins.splice(key, 1);

					return Promise.resolve(name);
				}).catch(function (err) {
					return _this15._error("uninstallByKey", err);
				});
			});
		}
	}, {
		key: "uninstallByDirectory",
		value: function uninstallByDirectory(directory, data) {
			var _this16 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				if (!exists) {
					return Promise.resolve(path.basename(directory));
				} else {

					var key = _this16._directoryToKey(directory);

					return -1 < key ? _this16.uninstallByKey(key, data) : fs.rmdirpProm(directory).then(function () {
						return Promise.resolve(path.basename(directory));
					});
				}
			}).catch(function (err) {
				return _this16._error("uninstallByDirectory", err);
			});
		}
	}, {
		key: "uninstall",
		value: function uninstall(plugin, data) {

			return plugin && plugin.directory ? this.uninstallByDirectory(plugin.directory, data) : Promise.reject(new Error("There is no plugin"));
		}
	}], [{
		key: "plugin",
		get: function get() {
			return Plugin;
		}
	}]);

	return PluginsManager;
}(require("asynchronous-eventemitter"));