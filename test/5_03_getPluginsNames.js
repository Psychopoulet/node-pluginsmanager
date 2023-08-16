"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { strictEqual } = require("node:assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / getPluginsNames", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	afterEach(() => {

		return pluginsManager.destroyAll();

	});

	it("should check plugins names before loading", () => {

		strictEqual(typeof pluginsManager.plugins, "object", "loaded plugins is not an object");
		strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
		strictEqual(pluginsManager.plugins.length, 0, "loaded plugins are incorrects");

		const pluginsNames = pluginsManager.getPluginsNames();

		strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
		strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
		strictEqual(pluginsNames.length, 0, "plugins names length is incorrect");

	});

	it("should test normal loading", () => {

		return pluginsManager.loadAll().then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "loaded plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
			strictEqual(pluginsManager.plugins.length, 3, "loaded plugins are incorrects");

			const pluginsNames = pluginsManager.getPluginsNames();

			strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
			strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
			strictEqual(pluginsNames.length, 3, "plugins names length is incorrect");

		});

	});

});
