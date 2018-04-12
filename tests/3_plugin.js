"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

// private

	const Plugin = require(join(__dirname, "..", "lib", "plugin.js"));

// tests

describe("Plugin", () => {

	let plugin = null;

	it("should test constructor", () => {
		plugin = new Plugin();
	});

	it("should load data from inexistant directory", (done) => {

		plugin.directory = join(__dirname, "zsgfzeojrfnoaziendfzoe");
		plugin.loadDataFromPackageFile().then(() => {
			done(new Error("Inexistant directory used"));
		}).catch((err) => {

			assert.strictEqual("object", typeof err, "Generated error is not an object");
			assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

			done();

		});

	});

	it("should load data from inexistant package file", (done) => {

		plugin.directory = join(__dirname);
		plugin.loadDataFromPackageFile().then(() => {
			done(new Error("Inexistant file loaded"));
		}).catch((err) => {

			assert.strictEqual("object", typeof err, "Generated error is not an object");
			assert.strictEqual(true, err instanceof Error, "Generated error is not an Error");

			done();

		});

	});

	it("should load data from package file", () => {

		plugin.directory = join(__dirname, "plugins", "TestGoodPlugin");
		return plugin.loadDataFromPackageFile().then(() => {

			assert.strictEqual("object", typeof plugin.authors, "authors are not an object");
			assert.strictEqual(true, plugin.authors instanceof Array, "authors are not an Array");
			assert.strictEqual(1, plugin.authors.length, "authors does not have the right length");

				assert.strictEqual("string", typeof plugin.authors[0], "first author does have the right value");
				assert.strictEqual("Sébastien VIDAL", plugin.authors[0], "first author does have the right value");

			assert.strictEqual("string", typeof plugin.description, "description does have the right value");
			assert.strictEqual("A test for node-pluginsmanager", plugin.description, "description does have the right value");

			assert.strictEqual("object", typeof plugin.dependencies, "dependencies are not an object");
				assert.strictEqual("string", typeof plugin.dependencies.simpletts, "first dependency does have the right value");
				assert.strictEqual("^1.4.1", plugin.dependencies.simpletts, "first dependency does have the right value");

			assert.strictEqual("object", typeof plugin.designs, "designs are not an object");
			assert.strictEqual(true, plugin.designs instanceof Array, "designs are not an Array");
			assert.strictEqual(1, plugin.designs.length, "designs does not have the right length");

				assert.strictEqual("string", typeof plugin.designs[0], "first design does have the right value");
				assert.strictEqual(
					join(__dirname, "plugins", "TestGoodPlugin", "design.css"),
					plugin.designs[0],
					"first design does have the right value"
				);

			assert.strictEqual("string", typeof plugin.directory, "directory does have the right value");
			assert.strictEqual(join(__dirname, "plugins", "TestGoodPlugin"), plugin.directory, "directory does have the right value");

			assert.strictEqual("string", typeof plugin.github, "github does have the right value");
			assert.strictEqual("", plugin.github, "github does have the right value");

			assert.strictEqual("object", typeof plugin.javascripts, "javascripts are not an object");
			assert.strictEqual(true, plugin.javascripts instanceof Array, "javascripts are not an Array");
			assert.strictEqual(1, plugin.javascripts.length, "javascripts does not have the right length");

				assert.strictEqual("string", typeof plugin.javascripts[0], "first javascript does have the right value");
				assert.strictEqual(
					join(__dirname, "plugins", "TestGoodPlugin", "javascript.js"),
					plugin.javascripts[0],
					"first javascript does have the right value"
				);

			assert.strictEqual("string", typeof plugin.license, "license does have the right value");
			assert.strictEqual("ISC", plugin.license, "license does have the right value");

			assert.strictEqual("string", typeof plugin.name, "license name have the right value");
			assert.strictEqual("TestGoodPlugin", plugin.name, "name does have the right value");

			assert.strictEqual("object", typeof plugin.templates, "templates are not an object");
			assert.strictEqual(true, plugin.templates instanceof Array, "templates are not an Array");
			assert.strictEqual(1, plugin.templates.length, "templates does not have the right length");

				assert.strictEqual("string", typeof plugin.templates[0], "first template does have the right value");
				assert.strictEqual(
					join(__dirname, "plugins", "TestGoodPlugin", "template.html"),
					plugin.templates[0],
					"first template does have the right value"
				);

			assert.strictEqual("string", typeof plugin.version, "license version have the right value");
			assert.strictEqual("0.0.2", plugin.version, "version does have the right value");

			return Promise.resolve();

		});

	});

	it("should load plugin", () => {
		return plugin.load("test load");
	});

	it("should unload plugin", () => {
		return plugin.unload("test unload");
	});

	it("should install plugin", () => {
		return plugin.install("test install");
	});

	it("should update plugin", () => {
		return plugin.update("test update");
	});

	it("should uninstall plugin", () => {
		return plugin.uninstall("test uninstall");
	});

});
