
"use strict";

// deps

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var path = require("path"),
    exec = require("child_process").exec,
    spawn = require("child_process").spawn,
    fs = require("node-promfs"),
    plugin = require(path.join(__dirname, "plugin.js"));

// private

// methods

function _directoryToKey(that, directory) {

	var result = -1;

	for (var i = 0; i < that.plugins.length; ++i) {
		if (that.plugins[i].directory === directory) {
			result = i;break;
		}
	}

	return result;
}

function _createPluginByDirectory(directory) {

	return fs.isDirectoryProm(directory).then(function (exists) {

		if (!exists) {
			return Promise.reject("\"" + directory + "\" does not exist");
		} else if (!path.isAbsolute(directory)) {
			return Promise.reject("\"" + directory + "\" is not an absolute path");
		} else {

			var _Plugin = require(directory),
			    oPlugin = void 0;

			if ("function" !== typeof _Plugin) {
				return Promise.reject("\"" + directory + "\" is not a function");
			} else {

				oPlugin = new _Plugin();
				oPlugin.directory = directory;
				oPlugin.name = path.basename(directory);

				if (!(oPlugin instanceof plugin)) {
					return Promise.reject("\"" + path.basename(directory) + "\" is not a plugin class");
				} else {
					return oPlugin.loadDataFromPackageFile();
				}
			}
		}
	});
}

function _loadOrderedNext(that, i, data) {

	if (i >= that.orderedDirectoriesBaseNames.length) {
		return Promise.resolve();
	} else {

		return that.loadByDirectory(path.join(that.directory, that.orderedDirectoriesBaseNames[i]), data ? data : null).then(function () {
			return _loadOrderedNext(that, i + 1, data);
		});
	}
}

function _unloadNext(that, data) {

	if (0 >= that.plugins.length) {
		return Promise.resolve();
	} else {
		return that.unloadByKey(that.plugins.length - 1, data);
	}
}

function _stdToString(msg) {

	if ("object" === (typeof msg === "undefined" ? "undefined" : _typeof(msg))) {

		if (msg instanceof Buffer) {
			msg = msg.toString("utf8");
		} else {
			msg = msg.message ? msg.message : msg;
		}
	}

	return msg;
}

function _error(that, fnName, err) {

	err = _stdToString(err);

	that.emit("error", fnName + " : " + err);
	return Promise.reject(err);
}

// git

function _GIT(params) {

	if (-1 >= process.env.PATH.indexOf("Git") && -1 >= process.env.PATH.indexOf("git")) {
		return Promise.reject("\"git\" is probably not registered in your PATH");
	} else {

		return new Promise(function (resolve, reject) {

			var result = "",
			    mySpawn = spawn("git", params).on("error", function (msg) {
				result += _stdToString(msg);
			}).on("close", function (code) {

				if (code) {
					reject(result);
				} else {
					resolve();
				}
			});

			mySpawn.stdout.on("data", function (msg) {
				result += _stdToString(msg);
			});

			mySpawn.stderr.on("data", function (msg) {
				result += _stdToString(msg);
			});
		});
	}
}

// npm

function _NPM(directory, command) {

	if (-1 >= process.env.PATH.indexOf("npm")) {
		return Promise.reject("\"npm\" is probably not registered in your PATH");
	} else {

		return fs.mkdirpProm(directory).then(function () {

			return new Promise(function (resolve, reject) {

				exec("cd \"" + directory + "\" && npm " + command, function (err, stdout, stderr) {

					if (err) {
						reject(_stdToString(stderr));
					} else {
						resolve();
					}
				});
			});
		});
	}
}

// module

module.exports = function (_require) {
	_inherits(PluginsManager, _require);

	function PluginsManager(directory) {
		_classCallCheck(this, PluginsManager);

		var _this = _possibleConstructorReturn(this, (PluginsManager.__proto__ || Object.getPrototypeOf(PluginsManager)).call(this));

		_this.directory = directory && "string" === typeof directory ? directory : path.join(__dirname, "plugins");
		_this.orderedDirectoriesBaseNames = [];
		_this.plugins = [];

		_this._beforeLoadAll = null;

		return _this;
	}

	// getters

	_createClass(PluginsManager, [{
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

			if ("object" !== (typeof pluginsDirectoriesBaseNames === "undefined" ? "undefined" : _typeof(pluginsDirectoriesBaseNames)) || !(pluginsDirectoriesBaseNames instanceof Array)) {
				return _error(this, "setOrder", "This is not an array");
			} else {

				var errors = [];
				for (var i = 0; i < pluginsDirectoriesBaseNames.length; ++i) {

					if ("string" !== typeof pluginsDirectoriesBaseNames[i] || "" === pluginsDirectoriesBaseNames[i].trim()) {
						errors.push("The directory at index \"" + i + "\" must be a string and not empty");
					}
				}

				if (errors.length) {
					return _error(this, "setOrder", errors.join("\r\n"));
				} else {
					this.orderedDirectoriesBaseNames = pluginsDirectoriesBaseNames;
					return Promise.resolve();
				}
			}
		}

		// inherited

	}, {
		key: "emit",
		value: function emit(eventName, eventData) {

			if (0 < this.listenerCount(eventName)) {

				if (eventData) {
					_get(PluginsManager.prototype.__proto__ || Object.getPrototypeOf(PluginsManager.prototype), "emit", this).call(this, eventName, eventData);
				} else {
					_get(PluginsManager.prototype.__proto__ || Object.getPrototypeOf(PluginsManager.prototype), "emit", this).call(this, eventName);
				}
			}
		}

		// load / unload

	}, {
		key: "beforeLoadAll",
		value: function beforeLoadAll(callback) {

			if ("function" !== typeof callback) {
				return _error(this, "beforeLoadAll", "This is not a function");
			} else {
				this._beforeLoadAll = callback;
				return Promise.resolve();
			}
		}

		// load

	}, {
		key: "loadByDirectory",
		value: function loadByDirectory(directory, data) {
			var _this2 = this;

			if ("string" !== typeof directory) {
				return _error(this, "loadByDirectory", "\"directory\" parameter is not a string");
			} else {
				var _ret = function () {

					var plugin = null;
					for (var i = 0; i < _this2.plugins.length; ++i) {

						if (directory == _this2.plugins[i].directory) {
							plugin = _this2.plugins[i];
							break;
						}
					}

					if (plugin) {
						return {
							v: Promise.resolve(plugin)
						};
					} else {

						return {
							v: _createPluginByDirectory(directory).then(function (_plugin) {

								plugin = _plugin;
								return plugin.load(data ? data : null);
							}).then(function () {

								_this2.emit("loaded", plugin);
								_this2.plugins.push(plugin);

								return Promise.resolve(plugin);
							}).catch(function (err) {
								err = err ? err.message ? err.message : err : "No error given";
								return _error(_this2, "loadByDirectory", "\"" + (plugin ? plugin.name : path.basename(directory)) + "\" => " + err);
							})
						};
					}
				}();

				if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
			}
		}
	}, {
		key: "loadAll",
		value: function loadAll(data) {
			var _this3 = this;

			if ("" == this.directory) {
				return _error(this, "loadAll", "\"directory\" is not defined");
			} else {

				return fs.mkdirpProm(this.directory).then(function () {

					if ("function" !== typeof _this3._beforeLoadAll) {
						return Promise.resolve();
					} else {

						return new Promise(function (resolve, reject) {

							var fn = _this3._beforeLoadAll();

							if (!(fn instanceof Promise)) {
								reject("\"beforeLoadAll\" callback's return is not a Promise instance");
							} else {
								fn.then(resolve).catch(reject);
							}
						});
					}
				}).then(function () {
					return fs.readdirProm(_this3.directory);
				}).then(function (files) {

					if (0 >= files.length) {
						_this3.emit("allloaded");
						return Promise.resolve();
					} else {

						return _loadOrderedNext(_this3, 0, data).then(function () {

							return new Promise(function (resolve) {

								var i = files.length;
								files.forEach(function (file) {

									_this3.loadByDirectory(path.join(_this3.directory, file), data ? data : null).then(function () {

										i--;
										if (0 === i) {
											_this3.emit("allloaded");resolve();
										}
									}).catch(function () {

										i--;
										if (0 === i) {
											_this3.emit("allloaded");resolve();
										}
									});
								});
							});
						});
					}
				}).catch(function (err) {
					return _error(_this3, "loadAll", err);
				});
			}
		}

		// unload

	}, {
		key: "unloadByKey",
		value: function unloadByKey(key, data) {
			var _this4 = this;

			if ("number" !== typeof key) {
				return _error(this, "unloadByKey", "\"key\" is not an integer");
			} else if (!this.plugins[key]) {
				return _error(this, "unloadByKey", "There is no \"" + key + "\" plugin's key");
			} else {

				return this.plugins[key].unload(data ? data : null).then(function () {
					_this4.emit("unloaded", _this4.plugins[key]);
					_this4.plugins.splice(key, 1);
					return Promise.resolve();
				});
			}
		}
	}, {
		key: "unloadByDirectory",
		value: function unloadByDirectory(directory, data) {
			var _this5 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				if (!exists) {
					return _error(_this5, "unloadByDirectory", "There is no \"" + directory + "\" plugin's directory");
				} else {

					var key = _directoryToKey(_this5, directory);
					if (-1 < key) {
						return _this5.unloadByKey(key, data ? data : null);
					} else {
						return Promise.reject("Impossible to find \"" + directory + "\" plugin's directory");
					}
				}
			}).catch(function (err) {
				return _error(_this5, "unloadByDirectory", err);
			});
		}
	}, {
		key: "unload",
		value: function unload(plugin, data) {
			var _this6 = this;

			return this.unloadByDirectory(plugin.directory, data ? data : null).catch(function (err) {
				return _error(_this6, "unload", err);
			});
		}
	}, {
		key: "unloadAll",
		value: function unloadAll(data) {
			var _this7 = this;

			return _unloadNext(this, data).then(function () {
				_this7.emit("allunloaded");
				return Promise.resolve();
			});
		}

		// write

		// add

	}, {
		key: "installViaGithub",
		value: function installViaGithub(url, data) {
			var _this8 = this;

			if ("string" !== typeof url) {
				return _error(this, "installViaGithub", "\"url\" is not a string");
			} else {

				url = url.trim();

				if ("" == url) {
					return _error(this, "installViaGithub", "\"url\" is empty");
				} else if (-1 == url.indexOf("github")) {
					return _error(this, "installViaGithub", "\"" + url + "\" is not a valid github url");
				} else if (-1 == url.indexOf("https")) {
					return _error(this, "installViaGithub", "\"" + url + "\" is not a valid https url");
				} else {
					var _ret2 = function () {

						var tabUrl = url.split("/"),
						    directory = path.join(_this8.directory, tabUrl[tabUrl.length - 1]);

						return {
							v: fs.isDirectoryProm(directory).then(function (exists) {

								if (exists) {
									return Promise.reject("\"" + directory + "\" aldready exists");
								} else {

									// git clone
									return _GIT(["-c", "core.quotepath=false", "clone", "--recursive", "--depth=1", url, directory])(url, directory).then(function () {
										return _createPluginByDirectory(directory);
									}).then(function (plugin) {

										return Promise.resolve().then(function () {

											if (plugin.dependencies) {
												return _NPM(directory, "install");
											} else {
												return Promise.resolve();
											}
										}).then(function () {

											return plugin.install(data ? data : null).then(function () {

												_this8.emit("installed", plugin);
												return plugin.load(data ? data : null);
											}).then(function () {

												_this8.emit("loaded", plugin);
												_this8.plugins.push(plugin);
												return Promise.resolve(plugin);
											});
										});
									}).catch(function (err) {

										return _this8.uninstallByDirectory(directory, data ? data : null).then(function () {
											return Promise.reject("Impossible to install \"" + url + "\" plugin : " + err);
										});
									});
								}
							}).catch(function (err) {
								return _error(_this8, "installViaGithub", err);
							})
						};
					}();

					if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
				}
			}
		}

		// update

	}, {
		key: "updateByKey",
		value: function updateByKey(key, data) {
			var _this9 = this;

			if ("number" !== typeof key) {
				return _error(this, "updateByKey", "\"key\" is not an integer");
			} else if (!this.plugins[key]) {
				return _error(this, "updateByKey", "There is no \"" + key + "\" plugin's key");
			} else {
				var _ret3 = function () {

					var plugin = _this9.plugins[key];
					return {
						v: plugin.unload(data ? data : null, false).then(function () {

							_this9.emit("unloaded", plugin);
							_this9.plugins.splice(key, 1);

							if (!plugin.github) {
								return Promise.resolve();
							} else {
								// git update
								return _GIT(["-c", plugin.directory, "pull"])(plugin.directory);
							}
						}).then(function () {
							return _createPluginByDirectory(plugin.directory);
						}).then(function (plugin) {

							return Promise.resolve().then(function () {

								if (plugin.dependencies) {
									return _NPM(plugin.directory, "update");
								} else {
									return Promise.resolve();
								}
							}).then(function () {
								return plugin.update(data ? data : null);
							}).then(function () {

								_this9.emit("updated", plugin);
								return plugin.load(data ? data : null);
							}).then(function () {

								_this9.emit("loaded", plugin);
								_this9.plugins.push(plugin);

								return Promise.resolve(plugin);
							});
						}).catch(function (err) {

							return _this9.uninstallByDirectory(plugin.directory, data ? data : null).then(function () {
								return Promise.reject("Impossible to update \"" + plugin.name + "\" : " + err);
							});
						})
					};
				}();

				if ((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object") return _ret3.v;
			}
		}
	}, {
		key: "updateByDirectory",
		value: function updateByDirectory(directory, data) {
			var _this10 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				if (!exists) {
					return _error(_this10, "updateByDirectory", "There is no \"" + directory + "\" plugin's directory");
				} else {

					var key = _directoryToKey(_this10, directory);
					if (-1 < key) {
						return _this10.updateByKey(key, data ? data : null);
					} else {
						return Promise.reject("Impossible to find \"" + directory + "\" plugin's directory");
					}
				}
			}).catch(function (err) {
				return _error(_this10, "updateByDirectory", err);
			});
		}
	}, {
		key: "update",
		value: function update(plugin, data) {
			var _this11 = this;

			return this.updateByDirectory(plugin.directory, data ? data : null).catch(function (err) {
				return _error(_this11, "update", err);
			});
		}

		// uninstall

	}, {
		key: "uninstallByKey",
		value: function uninstallByKey(key, data) {
			var _this12 = this;

			if ("number" !== typeof key) {
				return _error(this, "uninstallByKey", "\"key\" is not an integer");
			} else if (!this.plugins[key]) {
				return _error(this, "uninstallByKey", "There is no \"" + key + "\" plugin's key");
			} else {

				return this.plugins[key].unload(data ? data : null).then(function () {

					_this12.emit("unloaded", _this12.plugins[key]);
					return _this12.plugins[key].uninstall(data ? data : null);
				}).then(function () {

					_this12.emit("uninstalled", _this12.plugins[key]);
					return fs.rmdirpProm(_this12.plugins[key].directory);
				}).then(function () {

					var name = _this12.plugins[key].name;
					_this12.plugins.splice(key, 1);

					return Promise.resolve(name);
				}).catch(function (err) {
					return _error(_this12, "uninstallByKey", err);
				});
			}
		}
	}, {
		key: "uninstallByDirectory",
		value: function uninstallByDirectory(directory, data) {
			var _this13 = this;

			return fs.isDirectoryProm(directory).then(function (exists) {

				if (!exists) {
					return Promise.resolve(path.basename(directory));
				} else {

					var key = _directoryToKey(_this13, directory);
					if (-1 < key) {
						return _this13.uninstallByKey(key, data ? data : null);
					} else {

						return fs.rmdirpProm(directory).then(function () {
							return Promise.resolve(path.basename(directory));
						});
					}
				}
			}).catch(function (err) {
				return _error(_this13, "uninstallByDirectory", err);
			});
		}
	}, {
		key: "uninstall",
		value: function uninstall(plugin, data) {
			var _this14 = this;

			return this.uninstallByDirectory(plugin.directory, data ? data : null).catch(function (err) {
				return _error(_this14, "uninstall", err);
			});
		}
	}], [{
		key: "plugin",
		get: function get() {
			return plugin;
		}
	}]);

	return PluginsManager;
}(require("asynchronous-eventemitter"));