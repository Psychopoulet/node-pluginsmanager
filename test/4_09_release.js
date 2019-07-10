"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
		const GOOD_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestGoodPlugin");

// tests

describe("pluginsmanager / release", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	describe("release", () => {

		it("should release plugin without plugin", (done) => {

			pluginsManager.release().then(() => {
				done(new Error("Empty plugin used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should release plugin", () => {

			return pluginsManager.initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {
				return pluginsManager.release(plugin);
			});

		});

	});

	describe("releaseByKey", () => {

		it("should release without key", (done) => {

			pluginsManager.releaseByKey().then(() => {
				done(new Error("Missing key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should release with wrong key", (done) => {

			pluginsManager.releaseByKey(2000).then(() => {
				done(new Error("Wrong key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

});
