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

describe("pluginsmanager / unload", () => {

	const pluginsManager = new PluginsManager();

	describe("unloadByKey", () => {

		it("should unload without key", (done) => {

			pluginsManager.unloadByKey().then(() => {
				done(new Error("Missing key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should unload with wrong key", (done) => {

			pluginsManager.unloadByKey(2000).then(() => {
				done(new Error("Wrong key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("unloadByDirectory", () => {

		it("should unload with inexistant directory", (done) => {

			pluginsManager.unloadByDirectory(join(__dirname, "teqfzqfzqevzqe")).then(() => {
				done(new Error("Inexistant directory used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should unload with wrong directory", (done) => {

			pluginsManager.unloadByDirectory(__dirname).then(() => {
				done(new Error("Wrong directory used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should unload with good directory", () => {

			return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then(() => {
				return pluginsManager.unloadByDirectory(GOOD_PLUGIN_DIRECTORY);
			});

		});

	});

	describe("unload", () => {

		it("should unload plugin without plugin", (done) => {

			pluginsManager.unload().then(() => {
				done(new Error("Empty plugin used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should unload plugin", () => {

			return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {
				return pluginsManager.unload(plugin);
			});

		});

	});

});
