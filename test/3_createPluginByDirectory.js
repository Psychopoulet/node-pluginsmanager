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

// consts

	const TESTS_PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const NOT_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestNotPlugin");
		const GOOD_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestGoodPlugin");

// tests

describe("createPluginByDirectory", () => {

	before(() => {
		return mkdirpProm(NOT_PLUGIN);
	});

	after(() => {
		return rmdirpProm(NOT_PLUGIN);
	});

	it("should test wrong directory", (done) => {

		createPluginByDirectory(join(__dirname, "oqnzoefnzeofn")).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test relative directory", (done) => {

		createPluginByDirectory(".").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test not plugin directory", (done) => {

		writeFileProm(
			join(NOT_PLUGIN, "package.json"),
			JSON.stringify({
				"name": "test",
				"main": "TestNotPlugin.js"
			}),
			"utf8"
		).then(() => {

			return writeFileProm(
				join(NOT_PLUGIN, "TestNotPlugin.js"),
				"// nothing to do here",
				"utf8"
			);

		}).then(() => {
			return createPluginByDirectory(NOT_PLUGIN);
		}).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test plugin directory", () => {

		return createPluginByDirectory(GOOD_PLUGIN).then((plugin) => {

			strictEqual(typeof plugin, "object", "Generated plugin is not an object");
			strictEqual(plugin instanceof Orchestrator, true, "Generated plugin is not an Orchestrator");

			return Promise.resolve();

		});

	});

});
