"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const GITHUB_USER = "Psychopoulet";

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / install via github", () => {

	it("should test download with wrong directory", (done) => {

		const pluginsManager = new PluginsManager();
		pluginsManager.directory = PLUGINS_DIRECTORY;

		const GITHUB_PACKAGE = "node-container";

		pluginsManager.installViaGithub(GITHUB_USER, GITHUB_PACKAGE).then(() => {
			done(new Error("tests does not generate error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

			pluginsManager.unloadAll().then(() => {
				return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_PACKAGE));
			}).then(() => {
				done();
			}).catch(done);

		});

	}).timeout(MAX_TIMOUT);

	it("should test download with valid directory", () => {

		const pluginsManager = new PluginsManager();
		pluginsManager.directory = PLUGINS_DIRECTORY;

		const GITHUB_PACKAGE = "node-pluginsmanager-plugin";

		return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_PACKAGE).then(() => {
			return pluginsManager.unloadAll();
		}).then(() => {
			return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_PACKAGE));
		});

	}).timeout(MAX_TIMOUT);

});
