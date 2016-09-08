
"use strict";

// deps
	
const 	fs = require("node-promfs"),
		path = require("path");

// module

module.exports = class AbstractPlugin {

	constructor () {

		this.directory = "";

		this.name = "";
		this.description = "";
		this.version = "";
		this.author = "";
		this.license = "";
		this.github = "";

		this.templates = [];
		this.javascripts = [];
		this.designs = [];

	}

	// read

	loadDataFromPackageFile () {

		return fs.isDirectoryProm(this.directory).then((exists) => {

			if (!exists) {
				return Promise.reject("\"" + this.directory + "\" does not exist.");
			}
			else {

				let file = path.join(this.directory, "package.json");

				return fs.isFileProm(file).then((exists) => {

					if (!exists) {
						return Promise.reject("\"" + file + "\" does not exist.");
					}
					else {

						let data = require(file);

						if (data.name) {
							this.name = data.name;
						}
						if (data.description) {
							this.description = data.description;
						}
						if (data.version) {
							this.version = data.version;
						}
						if (data.author) {
							this.author = data.author;
						}
						if (data.license) {
							this.license = data.license;
						}
						if (data.github) {
							this.github = data.github;
						}

						if (data.templates instanceof Array && 0 < data.templates.length) {

							for (let i = 0, l = data.templates.length; i < l; ++i) {

								data.templates[i] = path.join(this.directory, data.templates[i]);

								if (fs.isFileSync(data.templates[i])) {
									this.templates.push(data.templates[i]);
								}

							}

						}

						if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

							for (let i = 0, l = data.javascripts.length; i < l; ++i) {

								data.javascripts[i] = path.join(this.directory, data.javascripts[i]);

								if (fs.isFileSync(data.javascripts[i])) {
									this.javascripts.push(data.javascripts[i]);
								}

							}

						}

						if (data.designs instanceof Array && 0 < data.designs.length) {

							for (let i = 0, l = data.designs.length; i < l; ++i) {

								data.designs[i] = path.join(this.directory, data.designs[i]);

								if (fs.isFileSync(data.designs[i])) {
									this.designs.push(data.designs[i]);
								}

							}

						}

						return Promise.resolve(this);
		
					}

				});

			}

		});

	}

	// load

	
	load () {
		return Promise.resolve();
	}

	unload () {

		delete this.templates;
		delete this.javascripts;
		delete this.designs;

		return Promise.resolve();

	}

	// write

	install () { return Promise.resolve(); }
	update () { return Promise.resolve(); }
	uninstall () { return Promise.resolve(); }

};
