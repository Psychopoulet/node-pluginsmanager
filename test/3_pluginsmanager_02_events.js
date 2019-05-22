"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const { rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const PLUGINS_TMP_DIRECTORY = join(PLUGINS_DIRECTORY, "tmp");

// tests

describe("pluginsmanager / events", () => {

	const pluginsManager = new PluginsManager();

	before(() => {

		pluginsManager.directory = PLUGINS_TMP_DIRECTORY;

		return rmdirpProm(PLUGINS_TMP_DIRECTORY).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	after(() => {

		return rmdirpProm(PLUGINS_TMP_DIRECTORY).then(() => {
			return pluginsManager.unloadAll();
		});

	});

	it("should test not existing directory without event", () => {
		return pluginsManager.loadAll();
	});

	it("should test not existing directory with events", () => {

		// errors

		return pluginsManager.on("error", (msg) => {
			(0, console).log("--- [PluginsManager/events/error] \"" + msg + "\" ---");
		})

		// load

		.on("loaded", (plugin) => {
			(0, console).log("--- [PluginsManager/events/loaded] \"" + plugin.name + "\" (v" + plugin.version + ") loaded ---");
		}).on("allloaded", () => {
			(0, console).log("--- [PluginsManager/events/allloaded] ---");
		}).on("unloaded", (plugin) => {
			(0, console).log("--- [PluginsManager/events/unloaded] \"" + plugin.name + "\" (v" + plugin.version + ") unloaded ---");
		}).on("allunloaded", () => {
			(0, console).log("--- [PluginsManager/events/allunloaded] ---");
		})

		// write

		.on("installed", (plugin) => {
			(0, console).log("--- [PluginsManager/events/installed] \"" + plugin.name + "\" (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin) => {
			(0, console).log("--- [PluginsManager/events/updated] \"" + plugin.name + "\" (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (plugin) => {
			(0, console).log("--- [PluginsManager/events/uninstalled] \"" + plugin.name + "\" uninstalled ---");
		}).loadAll();

	});

});
