"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// externals
	const { rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

	const GITHUB_USER = "Psychopoulet";
	const GITHUB_CONTAINER_PACKAGE = "node-container";
	const GITHUB_PLUGIN_PACKAGE = "node-pluginsmanager-plugin-test";

// tests

describe("pluginsmanager / install via github", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	afterEach(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		}).then(() => {
			return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_CONTAINER_PACKAGE));
		}).then(() => {
			return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_PLUGIN_PACKAGE));
		});

	});

	it("should test download with wrong directory", (done) => {

		pluginsManager.installViaGithub(GITHUB_USER, GITHUB_CONTAINER_PACKAGE).then(() => {
			done(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	}).timeout(MAX_TIMOUT);

	it("should test download with valid directory", () => {

		return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_PLUGIN_PACKAGE);

	}).timeout(MAX_TIMOUT);

});
