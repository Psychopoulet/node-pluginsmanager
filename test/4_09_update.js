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

// tests

describe("pluginsmanager / update", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	afterEach(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		}).then(() => {
			return rmdirpProm(GOOD_PLUGIN_DIRECTORY);
		});

	});

	it("should test update on an inexistant plugin", (done) => {

		pluginsManager.updateViaGithub().then(() => {
			done(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

			done();

		});

	});

	it("should test update plugins and dependances", () => {

		return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO).then(() => {

			return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
				return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
			});

		}).then(() => {

			return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);

		}).then(() => {

			return pluginsManager.updateViaGithub(pluginsManager.plugins[0]);

		}).then(() => {

			return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
				return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
			});

		});

	}).timeout(MAX_TIMOUT);

});
