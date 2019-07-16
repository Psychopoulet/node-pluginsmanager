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
		}).then(() => {
			return pluginsManager.destroyAll();
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

		.on("initialized", (plugin) => {
			(0, console).log("--- [PluginsManager/events/initialized] \"" + plugin.name + "\" (v" + plugin.version + ") initialized ---");
		}).on("allinitialized", () => {
			(0, console).log("--- [PluginsManager/events/allinitialized] ---");
		}).on("released", (pluginName) => {
			(0, console).log("--- [PluginsManager/events/released] \"" + pluginName + "\" released ---");
		}).on("allreleased", () => {
			(0, console).log("--- [PluginsManager/events/allreleased] ---");
		}).on("destroyed", (pluginName) => {
			(0, console).log("--- [PluginsManager/events/destroyed] \"" + pluginName + "\" destroyed ---");
		}).on("alldestroyed", () => {
			(0, console).log("--- [PluginsManager/events/alldestroyed] ---");
		})

		// write

		.on("installed", (plugin) => {
			(0, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin) => {
			(0, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (pluginName) => {
			(0, console).log("--- [PluginsManager/events/uninstalled] \"" + pluginName + "\" uninstalled ---");
		}).initAll();

	});

});
