"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / loadAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	beforeEach(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
	});

	it("should test with wrong directory", (done) => {

		pluginsManager.directory = "fzefzefzefzqvvqrverv";

		pluginsManager.loadAll("test").then(() => {
			done(new Error("Does not generate Error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should load all", () => {

		return pluginsManager.loadAll("test").then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

			return Promise.resolve();

		});

	});

});
