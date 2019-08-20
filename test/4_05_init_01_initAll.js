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

describe("pluginsmanager / initAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	before(() => {

		return pluginsManager.loadAll();

	});

	after(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should init all", () => {

		pluginsManager.plugins.forEach((plugin, key) => {
			strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
			strictEqual(plugin.initialized, false, "plugin \"" + key + "\" is not valid");
		});

		return pluginsManager.initAll("test").then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

			pluginsManager.plugins.forEach((plugin, key) => {
				strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
				strictEqual(plugin.initialized, true, "plugin \"" + key + "\" is not valid");
			});

		});

	});

});
