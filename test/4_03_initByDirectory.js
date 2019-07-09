"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { mkdirpProm, rmdirpProm } = require("node-promfs");
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / initByDirectory", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	const EMPTY_PLUGIN_DIRECTORY = join(pluginsManager.directory, "TestEmptyPlugin");

	afterEach(() => {

		return rmdirpProm(EMPTY_PLUGIN_DIRECTORY).then(() => {
			return pluginsManager.releaseAll();
		});

	});

	it("should test without directory", (done) => {

		pluginsManager.initByDirectory().then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test with wrong directory", (done) => {

		pluginsManager.initByDirectory(false).then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test with empty directory", (done) => {

		pluginsManager.initByDirectory("").then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test with empty directory", (done) => {

		pluginsManager.initByDirectory("./").then(() => {
			done(new Error("Wrong file plugin used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test empty plugin", () => {

		return mkdirpProm(EMPTY_PLUGIN_DIRECTORY).then(() => {
			return pluginsManager.initByDirectory(EMPTY_PLUGIN_DIRECTORY);
		}).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			assert.strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

			return Promise.resolve();

		});

	});

	it("should test good plugin", () => {

		const GOOD_PLUGIN_DIRECTORY = join(pluginsManager.directory, "TestGoodPlugin");

		return pluginsManager.initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

			assert.strictEqual(typeof plugin, "object", "Generated plugin is not an object");
			assert.strictEqual(plugin instanceof Orchestrator, true, "Generated plugin is not an Error");

			assert.deepStrictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			assert.strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			assert.strictEqual(pluginsManager.plugins.length, 1, "plugins length is not valid");

			return Promise.resolve();

		});

	});

});
