"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / constructor", () => {

	it("should test empty params", () => {

		const pluginsManager = new PluginsManager();

		// private
		assert.strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
		assert.deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");
		assert.strictEqual(pluginsManager._maxListeners, 0, "Generated plugin is not as expected");

		// public
		assert.strictEqual(pluginsManager.directory, "", "Generated plugin is not as expected");
		assert.deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

	});

	it("should test given directory", () => {

		const pluginsManager = new PluginsManager({
			"directory": join(__dirname, "plugins2")
		});

		// private
		assert.strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
		assert.deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");
		assert.strictEqual(pluginsManager._maxListeners, 0, "Generated plugin is not as expected");

		// public
		assert.strictEqual(pluginsManager.directory, join(__dirname, "plugins2"), "Generated plugin is not as expected");
		assert.deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

	});

});
