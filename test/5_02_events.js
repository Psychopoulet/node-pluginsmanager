"use strict";

// deps

	// natives
	const { join } = require("node:path");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / events", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should test not existing directory without event", () => {

		return pluginsManager.loadAll().then(() => {
			return pluginsManager.initAll();
		}).then(() => {
			return pluginsManager.releaseAll();
		}).then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test not existing directory with events", () => {

		// errors

		pluginsManager.on("error", (msg) => {
			(0, console).log("--- [PluginsManager/events/error] \"" + msg + "\" ---");
		});

		// load / destroy

		pluginsManager.on("loaded", (plugin) => {
			(0, console).log("--- [PluginsManager/events/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") ---");
		}).on("allloaded", () => {
			(0, console).log("--- [PluginsManager/events/allloaded] ---");
		}).on("destroyed", (pluginName) => {
			(0, console).log("--- [PluginsManager/events/destroyed] \"" + pluginName + "\" ---");
		}).on("alldestroyed", () => {
			(0, console).log("--- [PluginsManager/events/alldestroyed] ---");
		});

		// init

		pluginsManager.on("initialized", (plugin) => {
			(0, console).log("--- [PluginsManager/events/initialized] \"" + plugin.name + "\" (v" + plugin.version + ") ---");
		}).on("allinitialized", () => {
			(0, console).log("--- [PluginsManager/events/allinitialized] ---");
		}).on("released", (plugin) => {
			(0, console).log("--- [PluginsManager/events/released] \"" + plugin.name + "\" (v" + plugin.version + ") ---");
		}).on("allreleased", () => {
			(0, console).log("--- [PluginsManager/events/allreleased] ---");
		});

		// write

		pluginsManager.on("installed", (plugin) => {
			(0, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") ---");
		}).on("updated", (plugin) => {
			(0, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") ---");
		}).on("uninstalled", (pluginName) => {
			(0, console).log("--- [PluginsManager/events/uninstalled] \"" + pluginName + "\" ---");
		});

		// execute

		return pluginsManager.loadAll().then(() => {
			return pluginsManager.initAll();
		}).then(() => {
			return pluginsManager.releaseAll();
		}).then(() => {
			return pluginsManager.destroyAll();
		});

	});

});
