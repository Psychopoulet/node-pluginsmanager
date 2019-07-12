"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const GITHUB_USER = "Psychopoulet";
	const GITHUB_REPO = "node-pluginsmanager-plugin-test";

// tests

describe("pluginsmanager / uninstall", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should uninstall with empty key", (done) => {

		pluginsManager.uninstall().then(() => {
			done(new Error("Empty key used"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should uninstall plugin", () => {

		return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO).then((plugin) => {
			return pluginsManager.uninstall(plugin);
		});

	}).timeout(MAX_TIMOUT);

});
