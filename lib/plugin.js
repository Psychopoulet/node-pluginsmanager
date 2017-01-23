
"use strict";

// deps
	
const 	fs = require("node-promfs"),
		path = require("path");

// module

module.exports = class AbstractPlugin {

	constructor () {

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

	loadDataFromPackageFile () {

		return fs.isDirectoryProm(this.directory).then((exists) => {

			if (!exists) {
				return Promise.reject(new Error("\"" + this.directory + "\" does not exist."));
			}
			else {

				let file = path.join(this.directory, "package.json");

				return fs.isFileProm(file).then((exists) => {

					if (!exists) {
						return Promise.reject(new Error("\"" + file + "\" does not exist."));
					}
					else {

						let data = require(file);

						if (data.authors) {
							this.authors = data.authors;
						}
						else if (data.author) {
							this.authors = [ data.author ];
						}

						if (data.dependencies) {
							this.dependencies = data.dependencies;
						}
						if (data.description) {
							this.description = data.description;
						}
						if (data.github) {
							this.github = data.github;
						}
						if (data.license) {
							this.license = data.license;
						}
						if (data.name) {
							this.name = data.name;
						}
						if (data.version) {
							this.version = data.version;
						}

						if (data.designs instanceof Array && 0 < data.designs.length) {

							for (let i = 0, l = data.designs.length; i < l; ++i) {
								this.designs.push(path.join(this.directory, data.designs[i]));
							}

						}

						if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

							for (let i = 0, l = data.javascripts.length; i < l; ++i) {
								this.javascripts.push(path.join(this.directory, data.javascripts[i]));
							}

						}

						if (data.templates instanceof Array && 0 < data.templates.length) {

							for (let i = 0, l = data.templates.length; i < l; ++i) {
								this.templates.push(path.join(this.directory, data.templates[i]));
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

		delete this.authors;
		delete this.designs;
		delete this.dependencies;
		delete this.javascripts;
		delete this.templates;

		return Promise.resolve();

	}

	// write

	install () { return Promise.resolve(); }
	update () { return Promise.resolve(); }
	uninstall () { return Promise.resolve(); }

};
