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
	const GITHUB_REPO = "node-pluginsmanager-plugin-test";
	const GITHUB_WRONG_REPO = "node-containerpattern";

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / install via github", () => {

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
			return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_REPO));
		}).then(() => {
			return rmdirpProm(join(PLUGINS_DIRECTORY, GITHUB_WRONG_REPO));
		});

	});

	describe("params", () => {

		describe("user", () => {

			it("should test update without user", (done) => {

				pluginsManager.installViaGithub().then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

					done();

				});

			});

			it("should test update with wrong user", (done) => {

				pluginsManager.installViaGithub(false).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

					done();

				});

			});

			it("should test update with empty user", (done) => {

				pluginsManager.installViaGithub("").then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof RangeError, true, "Generated error is not an instance of Error");

					done();

				});

			});

		});

		describe("repo", () => {

			it("should test update without repo", (done) => {

				pluginsManager.installViaGithub(GITHUB_USER).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

					done();

				});

			});

			it("should test update with wrong repo", (done) => {

				pluginsManager.installViaGithub(GITHUB_USER, false).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

					done();

				});

			});

			it("should test update with empty repo", (done) => {

				pluginsManager.installViaGithub(GITHUB_USER, "").then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof RangeError, true, "Generated error is not an instance of Error");

					done();

				});

			});

		});

	});

	describe("execute", () => {

		it("should test download with wrong repo", (done) => {

			pluginsManager.installViaGithub(GITHUB_USER, GITHUB_WRONG_REPO).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not as expected");
				strictEqual(err instanceof Error, true, "Generated error is not as expected");

				done();

			});

		}).timeout(MAX_TIMOUT);

		it("should test download with valid repo", () => {

			pluginsManager.on("installed", (plugin, data) => {

				strictEqual(typeof data, "string", "Events data is not a string");
				strictEqual(data, EVENTS_DATA, "Events data is not as expected");

				(0, console).log("--- [PluginsManager/events/installed] " + plugin.name + " - " + data);

			});

			return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO, EVENTS_DATA).then((plugin) => {

				strictEqual(typeof plugin, "object", "Plugin is not an object");
				strictEqual(typeof plugin.name, "string", "Plugin name is not a string");
				strictEqual(plugin.name, GITHUB_REPO, "Plugin name is not as expected");

			});

		}).timeout(MAX_TIMOUT);

		it("should test download already existing repo", (done) => {

			pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not as expected");
				strictEqual(err instanceof Error, true, "Generated error is not as expected");

				done();

			});

		});

	});

});
