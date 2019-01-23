"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / loadByDirectory", () => {

	const pluginsManager = new PluginsManager();

	before(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
		return pluginsManager.unloadAll();
	});

	after(() => {
		return pluginsManager.unloadAll();
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

			return Promise.resolve();

		}).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	it("should check plugins names after loading", () => {

		const pluginsNames = pluginsManager.getPluginsNames();

		assert.strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
		assert.strictEqual(pluginsNames instanceof Array, true, "plugins names is not an Array");
		assert.strictEqual(pluginsNames.length, 1, "plugins names length is incorrect");
		assert.strictEqual(pluginsNames[0], "TestGoodPlugin", "first plugin name is incorrect");

	});

});
