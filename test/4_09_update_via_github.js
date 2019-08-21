"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// externals
	const { isDirectoryProm, rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const GITHUB_USER = "Psychopoulet";
	const GITHUB_REPO = "node-pluginsmanager-plugin-test";

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const GOOD_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, GITHUB_REPO);
			const GOOD_PLUGIN_MODULES_DIRECTORY = join(GOOD_PLUGIN_DIRECTORY, "node_modules");

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / update via github", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	before(() => {
		return pluginsManager.loadAll();
	});

	after(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		}).then(() => {
			return rmdirpProm(GOOD_PLUGIN_DIRECTORY);
		});

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

	});

	describe("execute", () => {

		it("should test update plugins and dependances", () => {

			pluginsManager.on("updated", (plugin, data) => {

				strictEqual(typeof data, "string", "Events data is not a string");
				strictEqual(data, EVENTS_DATA, "Events data is not as expected");

				(0, console).log("--- [PluginsManager/events/updated] " + plugin.name + " - " + data);

			});

			return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO).then(() => {

				return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
					return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
				});

			}).then(() => {

				return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);

			}).then(() => {

				strictEqual(pluginsManager.plugins.length, 3, "Distant plugin not installed");

				return pluginsManager.updateViaGithub(pluginsManager.plugins[2], EVENTS_DATA);

			}).then(() => {

				return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
					return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
				});

			});

		}).timeout(MAX_TIMOUT);

	});

});
