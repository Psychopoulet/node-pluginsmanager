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
	const GITHUB_PACKAGE = "node-containerpattern";

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
		const DOWNLOADED_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "node-containerpattern");

// tests

describe("pluginsmanager / install via github", () => {

	const pluginsManager = new PluginsManager();
	pluginsManager.directory = PLUGINS_DIRECTORY;

	it("should test download with valid data", (done) => {

		pluginsManager.installViaGithub(GITHUB_USER, GITHUB_PACKAGE).then(() => {
			done(new Error("tests does not generate error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

			pluginsManager.unloadAll().then(() => {
				return rmdirpProm(DOWNLOADED_PLUGIN_DIRECTORY);
			}).then(() => {
				done();
			}).catch(done);

		});

	}).timeout(MAX_TIMOUT);

});
