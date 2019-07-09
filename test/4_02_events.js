"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const { mkdirpProm, rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / events", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins", "tmp")
	});

	beforeEach(() => {

		return mkdirpProm(pluginsManager.directory).then(() => {
			return pluginsManager.releaseAll();
		});

	});

	afterEach(() => {

		return pluginsManager.releaseAll().then(() => {
			return rmdirpProm(pluginsManager.directory);
		});

	});

	it("should test not existing directory without event", () => {
		return pluginsManager.initAll();
	});

	it("should test not existing directory with events", () => {

		// errors

		return pluginsManager.on("error", (msg) => {
			(0, console).log("--- [PluginsManager/events/error] \"" + msg + "\" ---");
		})

		// init

		.on("initialiazed", (plugin) => {
			(0, console).log("--- [PluginsManager/events/initialiazed] \"" + plugin.name + "\" (v" + plugin.version + ") initialiazed ---");
		}).on("allinitialiazed", () => {
			(0, console).log("--- [PluginsManager/events/allinitialiazed] ---");
		}).on("released", (plugin) => {
			(0, console).log("--- [PluginsManager/events/released] \"" + plugin.name + "\" (v" + plugin.version + ") released ---");
		}).on("allreleased", () => {
			(0, console).log("--- [PluginsManager/events/allreleased] ---");
		})

		// write

		.on("installed", (plugin) => {
			(0, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin) => {
			(0, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (plugin) => {
			(0, console).log("--- [PluginsManager/events/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		}).initAll();

	});

});
