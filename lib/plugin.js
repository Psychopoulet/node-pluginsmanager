/*
	eslint class-methods-use-this: 0
*/

"use strict";

// deps

	const { isDirectoryProm, isFileProm } = require("node-promfs");
	const { join } = require("path");

// module

module.exports = class AbstractPlugin extends require("asynchronous-eventemitter") {

	constructor () {

		super();

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

		return isDirectoryProm(this.directory).then((exists) => {

			return !exists ?
				Promise.reject(new Error("\"" + this.directory + "\" does not exist.")) :
				Promise.resolve().then(() => {

				const file = join(this.directory, "package.json");

				return isFileProm(file).then((_exists) => {

					return !_exists ?
						Promise.reject(new Error("\"" + file + "\" does not exist.")) :
						Promise.resolve().then(() => {

						const data = require(file);

						if (data.authors) {
							this.authors = data.authors;
						}
						else if (data.author) {
							this.authors = [ data.author ];
						}

						this.dependencies = data.dependencies ? data.dependencies : [];
						this.description = data.description ? data.description : "";
						this.github = data.github ? data.github : "";
						this.license = data.license ? data.license : "";
						this.name = data.name ? data.name : "";
						this.version = data.version ? data.version : "";

						if (data.designs instanceof Array && 0 < data.designs.length) {

							for (let i = 0, l = data.designs.length; i < l; ++i) {
								this.designs.push(join(this.directory, data.designs[i]));
							}

						}

						if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

							for (let i = 0, l = data.javascripts.length; i < l; ++i) {
								this.javascripts.push(join(this.directory, data.javascripts[i]));
							}

						}

						if (data.templates instanceof Array && 0 < data.templates.length) {

							for (let i = 0, l = data.templates.length; i < l; ++i) {
								this.templates.push(join(this.directory, data.templates[i]));
							}

						}

						return Promise.resolve(this);

					});

				});

			});

		});

	}

	// load

	load () {
		return Promise.resolve();
	}

	unload () {

		return Promise.resolve().then(() => {
			this.removeAllListeners(); return Promise.resolve();
		}).then(() => {

			delete this.authors;
			delete this.designs;
			delete this.dependencies;
			delete this.javascripts;
			delete this.templates;

			return Promise.resolve();

		});

	}

	// write

	install () {
		return Promise.resolve();
	}

	update () {
		return Promise.resolve();
	}

	uninstall () {
		return Promise.resolve();
	}

};
