/*
	eslint class-methods-use-this: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const { isDirectoryProm, isFileProm, readJSONFileProm } = require("node-promfs");

// module

module.exports = class AbstractPlugin extends require("events") {

	constructor () {

		super();

		this.authors = [];
		this.description = "";
		this.dependencies = {};
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

		// check directory
		return isDirectoryProm(this.directory).then((exists) => {

			return !exists ?
				Promise.reject(new Error("\"" + this.directory + "\" does not exist.")) :
				Promise.resolve();

		// check package.json
		}).then(() => {

			const file = join(this.directory, "package.json");

			return isFileProm(file).then((exists) => {

					return !exists ?
						Promise.reject(new Error("\"" + file + "\" does not exist.")) :
						Promise.resolve();

			// read package.json content
			}).then(() => {
				return readJSONFileProm(file);
			});

		// formate authors
		}).then((data) => {

			if (data.author) {

				if (data.authors) {
					this.authors = data.authors.slice(0);
					delete data.authors;
				}
				else {
					this.authors = [];
				}

				this.authors.push(data.author);

				delete data.author;

			}

			return Promise.resolve(data);

		// formate designs, javascripts & templates
		}).then((data) => {

			this.designs = [];
			if (data.designs) {

				if (data.designs instanceof Array && 0 < data.designs.length) {

					for (let i = 0, l = data.designs.length; i < l; ++i) {
						this.designs.push(join(this.directory, data.designs[i]));
					}

				}

				delete data.designs;

			}

			this.javascripts = [];
			if (data.javascripts) {

				if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

					for (let i = 0, l = data.javascripts.length; i < l; ++i) {
						this.javascripts.push(join(this.directory, data.javascripts[i]));
					}

				}

				delete data.javascripts;

			}

			this.templates = [];
			if (data.templates) {

				if (data.templates instanceof Array && 0 < data.templates.length) {

					for (let i = 0, l = data.templates.length; i < l; ++i) {
						this.templates.push(join(this.directory, data.templates[i]));
					}

				}

				delete data.templates;

			}

			return Promise.resolve(data);

		// formate other data
		}).then((data) => {

			for (const key in data) {

				if (Object.prototype.hasOwnProperty.call(data, key)) {
					this[key] = data[key];
				}

			}

			return Promise.resolve(this);

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
