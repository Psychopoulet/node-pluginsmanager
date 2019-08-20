"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / getPluginsNames", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	afterEach(() => {

		return pluginsManager.destroyAll();

	});

	it("should check plugins names before loading", () => {

		const pluginsNames = pluginsManager.getPluginsNames();

		assert.strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
		assert.strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
		assert.strictEqual(pluginsNames.length, 0, "plugins names length is incorrect");

	});

	it("should test normal loading", () => {

		return pluginsManager.loadAll().then(() => {

			assert.strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
			assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

			assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

			const pluginsNames = pluginsManager.getPluginsNames();

			assert.strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
			assert.strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
			assert.strictEqual(pluginsNames.length, 2, "plugins names length is incorrect");

		});

	});

});
