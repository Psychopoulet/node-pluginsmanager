"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / destroy", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should destroy plugin without plugin", () => {

		return pluginsManager.loadAll().then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

			return pluginsManager.destroyAll();

		}).then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

			return Promise.resolve();

		});

	});

});
