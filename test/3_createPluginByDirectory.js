"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");
	const { homedir } = require("os");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");
	const { mkdirpProm, rmdirpProm, writeFileProm } = require("node-promfs");

	// locals
	const createPluginByDirectory = require(join(__dirname, "..", "lib", "createPluginByDirectory.js"));

// consts

	const TESTS_PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const NOT_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestNotPlugin");
		const GOOD_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestGoodPlugin");

	const TESTS_EXTERNAL_RESSOURCES_DIRECTORY = join(homedir(), "node-pluginsmanager-plugins-ressources");

// tests

describe("createPluginByDirectory", () => {

	before(() => {

		return mkdirpProm(NOT_PLUGIN).then(() => {
			return mkdirpProm(TESTS_EXTERNAL_RESSOURCES_DIRECTORY);
		});

	});

	after(() => {

		return rmdirpProm(NOT_PLUGIN).then(() => {
			return rmdirpProm(TESTS_EXTERNAL_RESSOURCES_DIRECTORY);
		});

	});

	describe("params", () => {

		describe("directory", () => {

			it("should test no directory", (done) => {

				createPluginByDirectory().then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test wrong directory", (done) => {

				createPluginByDirectory(false).then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof TypeError, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test empty directory", (done) => {

				createPluginByDirectory("").then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

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

		});

		describe("externalRessourcesDirectory", () => {

			it("should test no directory", (done) => {

				createPluginByDirectory(__dirname).then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test wrong directory", (done) => {

				createPluginByDirectory(__dirname, false).then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof TypeError, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test empty directory", (done) => {

				createPluginByDirectory(__dirname, "").then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test wrong directory", (done) => {

				createPluginByDirectory(__dirname, join(__dirname, "oqnzoefnzeofn")).then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

			});

			it("should test relative directory", (done) => {

				createPluginByDirectory(__dirname, ".").then(() => {
					done(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not an object");
					strictEqual(err instanceof Error, true, "Generated error is not an Error");

					done();

				});

			});

		});

	});

	describe("execute", () => {

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
				return createPluginByDirectory(NOT_PLUGIN, TESTS_EXTERNAL_RESSOURCES_DIRECTORY);
			}).then(() => {
				done(new Error("There is no generated error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

		it("should test plugin directory", () => {

			return createPluginByDirectory(GOOD_PLUGIN, TESTS_EXTERNAL_RESSOURCES_DIRECTORY).then((plugin) => {

				strictEqual(typeof plugin, "object", "Generated plugin is not an object");
				strictEqual(plugin instanceof Orchestrator, true, "Generated plugin is not an Orchestrator");

			});

		});

	});

});
