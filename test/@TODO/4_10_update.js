"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { isDirectoryProm, rmdirpProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const GOOD_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestGoodPlugin");
			const GOOD_PLUGIN_MODULES_DIRECTORY = join(GOOD_PLUGIN_DIRECTORY, "node_modules");

// tests

describe("pluginsmanager / update", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	describe("update via github", () => {

		after(() => {

			return pluginsManager.releaseAll().then(() => {
				return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);
			});

		});

		it("should test update on an inexistant plugin", () => {

			return pluginsManager.updateByDirectory(join(pluginsManager.directory, "node-containerpattern")).then(() => {
				return Promise.reject(new Error("tests does not generate error"));
			}).catch((err) => {

				return new Promise((resolve) => {

					assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
					resolve();

				});

			});

		}).timeout(MAX_TIMOUT);

		it("should test update plugins and dependances", () => {

			return pluginsManager.initAll().then(() => {
				return pluginsManager.updateByDirectory(GOOD_PLUGIN_DIRECTORY);
			}).then(() => {

				return isDirectoryProm(GOOD_PLUGIN_MODULES_DIRECTORY).then((exists) => {
					return exists ? Promise.resolve() : Promise.reject(new Error("There is no npm udpate performed"));
				});

			});

		}).timeout(MAX_TIMOUT);

	});

	describe("updateByKey", () => {

		after(() => {

			return pluginsManager.releaseAll().then(() => {
				return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);
			});

		});

		it("should update with empty key", (done) => {

			pluginsManager.updateByKey().then(() => {
				done(new Error("Empty key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should update with wrong key", (done) => {

			pluginsManager.updateByKey(2000).then(() => {
				done(new Error("Wrong key used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("updateByDirectory", () => {

		after(() => {

			return pluginsManager.releaseAll().then(() => {
				return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);
			});

		});

		it("should update with empty directory", (done) => {

			pluginsManager.updateByDirectory().then(() => {
				done(new Error("Empty directory used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("update", () => {

		after(() => {

			return pluginsManager.releaseAll().then(() => {
				return rmdirpProm(GOOD_PLUGIN_MODULES_DIRECTORY);
			});

		});

		it("should update plugin without plugin", (done) => {

			pluginsManager.update().then(() => {
				done(new Error("Empty plugin used"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not an object");
				assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should update plugin", () => {

			return pluginsManager.initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {
				return pluginsManager.update(plugin);
			});

		}).timeout(MAX_TIMOUT);

	});

});
