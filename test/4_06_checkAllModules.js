"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / checkAllModules", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	before(() => {

		return pluginsManager.loadAll().then(() => {
			return pluginsManager.initAll();
		});

	});

	after(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test normal check", () => {

		return pluginsManager.checkAllModules();

	});

});
