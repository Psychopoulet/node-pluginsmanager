
"use strict";

// deps
	
const 	fs = require("node-promfs"),
		path = require("path");

// module

module.exports = class Plugin {

	constructor () {

		this.directory = "";

		this.name = "";
		this.description = "";
		this.version = "";
		this.author = "";
		this.license = "";
		this.github = "";

		this.widget = "";

		this.templates = [];
		this.javascripts = [];

	}

	// read

	loadDataFromPackageFile () {

		try {

			let that = this;
			return fs.isDirectoryProm(this.directory).then(function(exists) {

				if (!exists) {
					return Promise.reject("\"" + that.directory + "\" does not exist.");
				}
				else {

					let file = path.join(that.directory, "package.json");

					return fs.isFileProm(file).then(function(exists) {

						if (!exists) {
							return Promise.reject("\"" + file + "\" does not exist.");
						}
						else {

							let data = require(file);

							if (data.name) {
								that.name = data.name;
							}
							if (data.description) {
								that.description = data.description;
							}
							if (data.version) {
								that.version = data.version;
							}
							if (data.author) {
								that.author = data.author;
							}
							if (data.license) {
								that.license = data.license;
							}
							if (data.github) {
								that.github = data.github;
							}

							if (data.widget) {

								data.widget = path.join(that.directory, data.widget);

								if (fs.isFileSync(data.widget)) {
									that.widget = data.widget;
								}

							}

							if (data.templates instanceof Array && 0 < data.templates.length) {

								for (let i = 0, l = data.templates.length; i < l; ++i) {

									data.templates[i] = path.join(that.directory, data.templates[i]);

									if (fs.isFileSync(data.templates[i])) {
										that.templates.push(data.templates[i]);
									}

								}

							}

							if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

								for (let i = 0, l = data.javascripts.length; i < l; ++i) {

									data.javascripts[i] = path.join(that.directory, data.javascripts[i]);

									if (fs.isFileSync(data.javascripts[i])) {
										that.javascripts.push(data.javascripts[i]);
									}

								}

							}

							return Promise.resolve(that);
			
						}

					});

				}

			});

		}
		catch(e) {
			return Promise.reject((e.message) ? e.message : e);
		}

	}

	// load

	
	load () {
		return Promise.resolve();
	}

	unload () {

		delete this.templates;
		delete this.javascripts;

		return Promise.resolve();

	}

	// write

	install () { return Promise.resolve(); }
	update () { return Promise.resolve(); }
	uninstall () { return Promise.resolve(); }

};
