"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { mkdirpProm, rmdirpProm, unlinkProm, writeFileProm } = require("node-promfs");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const EMPTY_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestEmptyPlugin");

// tests

describe("pluginsmanager / loadByDirectory", () => {

	const pluginsManager = new PluginsManager();

	before(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
		return pluginsManager.unloadAll();
	});

	after(() => {
		return pluginsManager.unloadAll();
	});

	it("should test without directory", (done) => {

		pluginsManager.loadByDirectory(false).then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test wrong file plugin", (done) => {

		pluginsManager.loadByDirectory(false).then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test file plugin", () => {

		const sFilePlugin = join(PLUGINS_DIRECTORY, "TestFilePlugin.txt");

		return writeFileProm(sFilePlugin, "").then(() => {
			return pluginsManager.loadByDirectory(sFilePlugin);
		}).then(() => {

			assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			assert.strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

			return Promise.resolve();

		}).then(() => {
			return unlinkProm(sFilePlugin);
		});

	});

	it("should test empty plugin", () => {

		return mkdirpProm(EMPTY_PLUGIN_DIRECTORY).then(() => {
			return pluginsManager.loadByDirectory(EMPTY_PLUGIN_DIRECTORY);
		}).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				assert.strictEqual(
					err.message,
					"\"TestEmptyPlugin\" => Cannot find module '" + EMPTY_PLUGIN_DIRECTORY + "'",
					"this is not the expected message"
				);

				assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				assert.strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

				resolve();

			});

		}).then(() => {
			return rmdirpProm(EMPTY_PLUGIN_DIRECTORY);
		});

	});

});
