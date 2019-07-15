"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / initAll & setOrder", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	afterEach(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test normal check", () => {

		return pluginsManager.initAll().then(() => {
			return pluginsManager.checkAllModules();
		});

	});

});
