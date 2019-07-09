"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");
	const { mkdirpProm, rmdirpProm, writeFileProm } = require("node-promfs");

	// locals
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

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test relative directory", (done) => {

		createPluginByDirectory(".").then(() => {
			done(new Error("Relative directory used"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

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

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test plugin directory", () => {

		return createPluginByDirectory(goodPlugin).then((plugin) => {

			strictEqual(typeof plugin, "object", "Generated plugin is not an object");
			strictEqual(plugin instanceof Orchestrator, true, "Generated plugin is not an Orchestrator");

			return Promise.resolve();

		});

	});

});
