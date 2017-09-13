
"use strict";

// deps

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("node-promfs"),
    isDirectoryProm = _require.isDirectoryProm,
    isFileProm = _require.isFileProm;

var _require2 = require("path"),
    join = _require2.join;

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

			return isDirectoryProm(this.directory).then(function (exists) {

				if (!exists) {
					return Promise.reject(new Error("\"" + _this.directory + "\" does not exist."));
				} else {

					var file = join(_this.directory, "package.json");

					return isFileProm(file).then(function (_exists) {

						if (!_exists) {
							return Promise.reject(new Error("\"" + file + "\" does not exist."));
						} else {

							var data = require(file);

							if (data.authors) {
								_this.authors = data.authors;
							} else if (data.author) {
								_this.authors = [data.author];
							}

							_this.dependencies = data.dependencies ? data.dependencies : [];
							_this.description = data.description ? data.description : "";
							_this.github = data.github ? data.github : "";
							_this.license = data.license ? data.license : "";
							_this.name = data.name ? data.name : "";
							_this.version = data.version ? data.version : "";

							if (data.designs instanceof Array && 0 < data.designs.length) {

								for (var i = 0, l = data.designs.length; i < l; ++i) {
									_this.designs.push(join(_this.directory, data.designs[i]));
								}
							}

							if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

								for (var _i = 0, _l = data.javascripts.length; _i < _l; ++_i) {
									_this.javascripts.push(join(_this.directory, data.javascripts[_i]));
								}
							}

							if (data.templates instanceof Array && 0 < data.templates.length) {

								for (var _i2 = 0, _l2 = data.templates.length; _i2 < _l2; ++_i2) {
									_this.templates.push(join(_this.directory, data.templates[_i2]));
								}
							}

							return Promise.resolve(_this);
						}
					});
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