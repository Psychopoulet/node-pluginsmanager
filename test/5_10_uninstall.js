"use strict";

// deps

	// natives
	const { basename, join } = require("node:path");
	const { strictEqual } = require("node:assert");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const rmdirp = require(join(__dirname, "..", "lib", "cjs", "utils", "rmdirp.js")).default;
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));
	const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
		const TEST_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "test-uninstall");

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
				return rmdirp(TEST_PLUGIN_DIRECTORY);
			});

		});

		it("should uninstall plugin", () => {

			pluginsManager.on("uninstalled", (pluginName, data) => {

				strictEqual(typeof data, "string", "Events data is not a string");
				strictEqual(data, EVENTS_DATA, "Events data is not as expected");

				(0, console).log("--- [PluginsManager/events/uninstalled] " + pluginName + " - " + data);

			});

			const pluginName = basename(TEST_PLUGIN_DIRECTORY);

			return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
				"name": pluginName
			}).then(() => {
				return pluginsManager.loadAll();
			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 4, "Distant plugin not installed");

				return pluginsManager.uninstall(pluginsManager.plugins.filter((plugin) => {
					return pluginName === plugin.name;
				})[0] || null, EVENTS_DATA);

			});

		}).timeout(MAX_TIMOUT);

	});

});
