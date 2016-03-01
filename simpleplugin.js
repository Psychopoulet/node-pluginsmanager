
"use strict";

// deps
	
const 	fs = require('simplefs'),
		path = require('path');

// module

module.exports = class SimplePlugin {

	constructor () {

		this.directory = '';

		this.name = '';
		this.description = '';
		this.version = '';
		this.author = '';
		this.license = '';
		this.github = '';

		this.widget = '';

		this.templates = [];
		this.javascripts = [];

	}

	loadDataFromPackageFile () {

		if ('' == this.directory) {
			throw this.constructor.name + "/loadDataFromPackageFile : 'directory' is not defined.";
		}
		else if (!fs.dirExists(this.directory)) {
			throw this.constructor.name + "/loadDataFromPackageFile : '" + this.directory + "' does not exist.";
		}
		else {

			var file = path.join(this.directory, 'package.json');

			if (!fs.fileExists(file)) {
				throw this.constructor.name + "/loadDataFromPackageFile : '" + file + "' does not exist.";
			}
			else {

				var data = JSON.parse(fs.readFileSync(file, 'utf8'));

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

				if (data.widget) {

					data.widget = path.join(this.directory, data.widget);

					if (fs.fileExists(data.widget)) {
						this.widget = data.widget;
					}

				}

				if (data.templates instanceof Array && 0 < data.templates.length) {

					for (var i = 0, l = data.templates.length; i < l; ++i) {

						data.templates[i] = path.join(this.directory, data.templates[i]);

						if (fs.fileExists(data.templates[i])) {
							this.templates.push(data.templates[i]);
						}

					}

				}

				if (data.javascripts instanceof Array && 0 < data.javascripts.length) {

					for (var i = 0, l = data.javascripts.length; i < l; ++i) {

						data.javascripts[i] = path.join(this.directory, data.javascripts[i]);

						if (fs.fileExists(data.javascripts[i])) {
							this.javascripts.push(data.javascripts[i]);
						}

					}

				}

			}
		
		}

		return this;

	}

	run () { }

	free () {
		
		delete this.templates;
		delete this.javascripts;

	}

}