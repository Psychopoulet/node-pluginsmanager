"use strict";

// deps

	// natives
	const { basename, join } = require("path");
	const { strictEqual } = require("assert");
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// externals
	const { rmdirpProm } = require("node-promfs");

	// locals
	const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));
	const isDirectory = require(join(__dirname, "..", "lib", "checkers", "isDirectory.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const TEST_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestUpdate");
			const TEST_PLUGIN_MODULES_DIRECTORY = join(TEST_PLUGIN_DIRECTORY, "node_modules");

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / update via github", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	describe("params", () => {

		it("should test update without plugin", (done) => {

			pluginsManager.updateViaGithub().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should test update with wrong plugin", (done) => {

			pluginsManager.updateViaGithub(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should test update with missing repo", (done) => {

			const orchestrator = new Orchestrator();

				orchestrator.name = basename(TEST_PLUGIN_DIRECTORY);

			pluginsManager.updateViaGithub(orchestrator).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should test update with not loaded plugin", (done) => {

			const orchestrator = new Orchestrator();

				orchestrator.name = basename(TEST_PLUGIN_DIRECTORY);
				orchestrator.github = "whatever";

			pluginsManager.updateViaGithub(orchestrator).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

				done();

			});

		});

	});

	describe("execute", () => {

		afterEach(() => {

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

		it("should test update plugins and dependancies with \"github\" parameter", () => {

			const pluginName = basename(TEST_PLUGIN_DIRECTORY);

			return copyPlugin(PLUGINS_DIRECTORY, "TestGoodPlugin", pluginName, {
				"name": pluginName,
				"github": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
			}).then(() => {

				return pluginsManager.loadAll();

			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 3, "Distant plugin not installed");

				return pluginsManager.updateViaGithub(pluginsManager.plugins.filter((plugin) => {
					return pluginName === plugin.name;
				})[0] || null, EVENTS_DATA);

			}).then(() => {

				return isDirectory("update/execute", TEST_PLUGIN_MODULES_DIRECTORY);

			});

		}).timeout(MAX_TIMOUT);

		it("should test update plugins and dependancies with \"repository\" parameter", () => {

			pluginsManager.on("updated", (plugin, data) => {

				strictEqual(typeof data, "string", "Events data is not a string");
				strictEqual(data, EVENTS_DATA, "Events data is not as expected");

				(0, console).log("--- [PluginsManager/events/updated] " + plugin.name + " - " + data);

			});

			const pluginName = basename(TEST_PLUGIN_DIRECTORY);

			return copyPlugin(PLUGINS_DIRECTORY, "TestGoodPlugin", pluginName, {
				"name": pluginName,
				"repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
			}).then(() => {

				return pluginsManager.loadAll();

			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 3, "Distant plugin not installed");

				return pluginsManager.updateViaGithub(pluginsManager.plugins.filter((plugin) => {
					return pluginName === plugin.name;
				})[0] || null, EVENTS_DATA);

			}).then(() => {

				return isDirectory("update/execute", TEST_PLUGIN_MODULES_DIRECTORY);

			});

		}).timeout(MAX_TIMOUT);

		it("should test update plugins and dependancies with \"repository.url\" parameter", () => {

			const pluginName = basename(TEST_PLUGIN_DIRECTORY);

			return copyPlugin(PLUGINS_DIRECTORY, "TestGoodPlugin", pluginName, {
				"name": pluginName,
				"repository": {
					"type": "git",
					"url": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
				}
			}).then(() => {

				return pluginsManager.loadAll();

			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 3, "Distant plugin not installed");

				return pluginsManager.updateViaGithub(pluginsManager.plugins.filter((plugin) => {
					return pluginName === plugin.name;
				})[0] || null, EVENTS_DATA);

			}).then(() => {

				return isDirectory("update/execute", TEST_PLUGIN_MODULES_DIRECTORY);

			});

		}).timeout(MAX_TIMOUT);

	});

});
