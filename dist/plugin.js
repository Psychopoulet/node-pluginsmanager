
"use strict";

// deps

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("node-promfs"),
    path = require("path");

// module

module.exports = function () {
	function AbstractPlugin() {
		_classCallCheck(this, AbstractPlugin);

		this.authors = [];
		this.description = "";
		this.dependencies = [];
		this.designs = [];
		this.directory = "";
		this.github = "";
		this.javascripts = [];
		this.license = "";
		this.name = "";
		this.templates = [];
		this.version = "";
	}

	// read

	_createClass(AbstractPlugin, [{
		key: "loadDataFromPackageFile",
		value: function loadDataFromPackageFile() {
			var _this = this;

			return fs.isDirectoryProm(this.directory).then(function (exists) {

				if (!exists) {
					return Promise.reject("\"" + _this.directory + "\" does not exist.");
				} else {
					var _ret = function () {

						var file = path.join(_this.directory, "package.json");

						return {
							v: fs.isFileProm(file).then(function (exists) {

								if (!exists) {
									return Promise.reject("\"" + file + "\" does not exist.");
								} else {

									var data = require(file);

									if (data.authors) {
										_this.authors = data.authors;
									}
									if (data.dependencies) {
										_this.dependencies = data.dependencies;
									}
									if (data.description) {
										_this.description = data.description;
									}
									if (data.github) {
										_this.github = data.github;
									}
									if (data.license) {
										_this.license = data.license;
									}
									if (data.name) {
										_this.name = data.name;
									}
									if (data.version) {
										_this.version = data.version;
									}

									if (data.designs instanceof Array && 0 < data.designs.length) {

										for (var i = 0, l = data.designs.length; i < l; ++i) {
											_this.designs.push(path.join(_this.directory, data.designs[i]));
										}
									}

									if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

										for (var _i = 0, _l = data.javascripts.length; _i < _l; ++_i) {
											_this.javascripts.push(path.join(_this.directory, data.javascripts[_i]));
										}
									}

									if (data.templates instanceof Array && 0 < data.templates.length) {

										for (var _i2 = 0, _l2 = data.templates.length; _i2 < _l2; ++_i2) {
											_this.templates.push(path.join(_this.directory, data.templates[_i2]));
										}
									}

									return Promise.resolve(_this);
								}
							})
						};
					}();

					if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
				}
			});
		}

		// load


	}, {
		key: "load",
		value: function load() {
			return Promise.resolve();
		}
	}, {
		key: "unload",
		value: function unload() {

			delete this.authors;
			delete this.designs;
			delete this.dependencies;
			delete this.javascripts;
			delete this.templates;

			return Promise.resolve();
		}

		// write

	}, {
		key: "install",
		value: function install() {
			return Promise.resolve();
		}
	}, {
		key: "update",
		value: function update() {
			return Promise.resolve();
		}
	}, {
		key: "uninstall",
		value: function uninstall() {
			return Promise.resolve();
		}
	}]);

	return AbstractPlugin;
}();