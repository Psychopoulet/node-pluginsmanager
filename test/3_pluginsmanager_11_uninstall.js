"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { mkdirpProm, rmdirpProm, writeFileProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const EMPTY_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestEmptyPlugin");

// tests

describe("pluginsmanager / uninstall", () => {

	const pluginsManager = new PluginsManager();

	beforeEach(() => {
		return mkdirpProm(EMPTY_PLUGIN_DIRECTORY);
	});

	afterEach(() => {
		return rmdirpProm(EMPTY_PLUGIN_DIRECTORY);
	});

	describe("uninstallByKey", () => {

		it("should uninstall with empty key", (done) => {

			pluginsManager.uninstallByKey().then(() => {
				done(new Error("Empty key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should uninstall with wrong key", (done) => {

			pluginsManager.uninstallByKey(2000).then(() => {
				done(new Error("Wrong key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("uninstallByDirectory", () => {

		it("should uninstall with empty directory", (done) => {

			pluginsManager.uninstallByDirectory().then(() => {
				done(new Error("Empty directory used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should uninstall inexistant plugin by directory", () => {
			return pluginsManager.uninstallByDirectory("szofuhzesifguhezifu");
		});

		it("should uninstall empty plugin by directory", () => {
			return pluginsManager.uninstallByDirectory(EMPTY_PLUGIN_DIRECTORY);
		});

	});

	describe("uninstall", () => {

		it("should uninstall plugin without plugin", (done) => {

			pluginsManager.uninstall().then(() => {
				done(new Error("Empty plugin used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should uninstall plugin", () => {

			return writeFileProm(
				join(EMPTY_PLUGIN_DIRECTORY, "package.json"),
				JSON.stringify({
					"name": "test",
					"main": "TestEmptyPlugin.js"
				}),
				"utf8"
			).then(() => {

				return writeFileProm(
					join(EMPTY_PLUGIN_DIRECTORY, "TestEmptyPlugin.js"),
					"\n\"use strict\";" +
					"\n\nmodule.exports = class TestEmptyPlugin " +
					"extends require(require(\"path\").join(\"..\", \"..\", \"..\", \"lib\", \"main.js\")).plugin { };",
					"utf8"
				);

			}).then(() => {
				return pluginsManager.loadByDirectory(EMPTY_PLUGIN_DIRECTORY);
			}).then((plugin) => {
				return pluginsManager.uninstall(plugin);
			});

		});

	});

});
