"use strict";

// deps

	// natives
	const { join } = require("path");
	const { homedir } = require("os");
	const { deepStrictEqual, strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / constructor", () => {

	it("should test empty params", () => {

		const pluginsManager = new PluginsManager();

		// private
		strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
		deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");

		// public
		strictEqual(pluginsManager.directory, join(homedir(), "node-pluginsmanager-plugins"), "Generated plugin is not as expected");
		deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

	});

	it("should test given directory", () => {

		const pluginsManager = new PluginsManager({
			"directory": join(__dirname, "plugins2")
		});

		// private
		strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
		deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");

		// public
		strictEqual(pluginsManager.directory, join(__dirname, "plugins2"), "Generated plugin is not as expected");
		deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

	});

});
