"use strict";

// deps

	// natives
	const { basename, join } = require("path");
	const { strictEqual } = require("assert");

	// externals
	const { rmdirpProm } = require("node-promfs");
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
		const TEST_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestUninstall");

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / uninstall", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	describe("params", () => {

		it("should test update without plugin", (done) => {

			pluginsManager.uninstall().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should test update with wrong plugin", (done) => {

			pluginsManager.uninstall(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should test update with not loaded plugin", (done) => {

			const orchestrator = new Orchestrator();

				orchestrator.name = basename(TEST_PLUGIN_DIRECTORY);
				orchestrator.github = "whatever";

			pluginsManager.uninstall(orchestrator).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

				done();

			});

		});

	});

	describe("execute", () => {

		after(() => {

			pluginsManager.removeAllListeners();

			return pluginsManager.releaseAll().then(() => {
				return pluginsManager.destroyAll();
			}).then(() => {
				return rmdirpProm(TEST_PLUGIN_DIRECTORY);
			}).then(() => {

				return new Promise((resolve) => {
					setTimeout(resolve, 500);
				});

			});

		});

		it("should uninstall plugin", () => {

			pluginsManager.on("uninstalled", (plugin, data) => {

				strictEqual(typeof data, "string", "Events data is not a string");
				strictEqual(data, EVENTS_DATA, "Events data is not as expected");

				(0, console).log("--- [PluginsManager/events/uninstalled] " + plugin.name + " - " + data);

			});

			const pluginName = basename(TEST_PLUGIN_DIRECTORY);

			return copyPlugin(PLUGINS_DIRECTORY, "TestGoodPlugin", pluginName, {
				"name": pluginName
			}).then(() => {
				return pluginsManager.loadAll();
			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 3, "Distant plugin not installed");

				return pluginsManager.uninstall(pluginsManager.plugins.filter((plugin) => {
					return pluginName === plugin.name;
				})[0] || null, EVENTS_DATA);

			});

		}).timeout(MAX_TIMOUT);

	});

});
