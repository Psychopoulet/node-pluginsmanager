"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// externals
	const { mkdirpProm, rmdirpProm, writeFileProm } = require("node-promfs");

	// locals
	const Plugin = require(join(__dirname, "..", "lib", "plugin.js"));
	const createPluginByDirectory = require(join(__dirname, "..", "lib", "createPluginByDirectory.js"));

// private

	const testsPluginsDirectory = join(__dirname, "plugins");

		const notPlugin = join(testsPluginsDirectory, "TestNotPlugin");
		const goodPlugin = join(testsPluginsDirectory, "TestGoodPlugin");

// tests

describe("createPluginByDirectory", () => {

	beforeEach(() => {
		return mkdirpProm(notPlugin);
	});

	afterEach(() => {
		return rmdirpProm(notPlugin);
	});

	it("should test wrong directory", (done) => {

		createPluginByDirectory(join(__dirname, "oqnzoefnzeofn")).then(() => {
			done(new Error("Inexistant directory used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test relative directory", (done) => {

		createPluginByDirectory(".").then(() => {
			done(new Error("Relative directory used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test not plugin directory", (done) => {

		writeFileProm(
			join(notPlugin, "package.json"),
			JSON.stringify({
				"name": "test",
				"main": "TestNotPlugin.js"
			}),
			"utf8"
		).then(() => {

			return writeFileProm(
				join(notPlugin, "TestNotPlugin.js"),
				"// nothing to do here",
				"utf8"
			);

		}).then(() => {
			return createPluginByDirectory(notPlugin);
		}).then(() => {
			done(new Error("Relative directory used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test plugin directory", () => {

		return createPluginByDirectory(goodPlugin).then((plugin) => {

			assert.strictEqual(typeof plugin, "object", "Generated plugin is not an object");
			assert.strictEqual(plugin instanceof Plugin, true, "Generated plugin is not an Error");

			return Promise.resolve();

		});

	});

});
