"use strict";

// deps

	// natives
	const { join } = require("path");
	const { deepStrictEqual, strictEqual } = require("assert");

	// locals
	const { mkdirpProm, rmdirpProm } = require("node-promfs");
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

		const GOOD_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "TestGoodPlugin");

// tests

describe("pluginsmanager / init", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	describe("_initByDirectory", () => {

		const EMPTY_PLUGIN_DIRECTORY = join(pluginsManager.directory, "TestEmptyPlugin");

		afterEach(() => {

			return pluginsManager.releaseAll().then(() => {
				return pluginsManager.destroyAll();
			}).then(() => {
				return rmdirpProm(EMPTY_PLUGIN_DIRECTORY);
			});

		});

		it("should test without directory", (done) => {

			pluginsManager._initByDirectory().then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof ReferenceError, true, "Generated error is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 1, "plugins length is not valid");

				done();

			});

		});

		it("should test with wrong directory", (done) => {

			pluginsManager._initByDirectory(false).then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof TypeError, true, "Generated error is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

				done();

			});

		});

		it("should test with empty directory", (done) => {

			pluginsManager._initByDirectory("").then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

				done();

			});

		});

		it("should test with empty directory", (done) => {

			pluginsManager._initByDirectory("./").then(() => {
				done(new Error("Wrong file plugin used"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

				done();

			});

		});

		it("should test empty plugin", (done) => {

			mkdirpProm(EMPTY_PLUGIN_DIRECTORY).then(() => {
				return pluginsManager._initByDirectory(EMPTY_PLUGIN_DIRECTORY);
			}).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

				done();

			});

		});

		it("should test good plugin", () => {

			return pluginsManager._initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

				strictEqual(typeof plugin, "object", "Generated plugin is not an object");
				strictEqual(plugin instanceof Orchestrator, true, "Generated plugin is not an Error");

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 1, "plugins length is not valid");

				return Promise.resolve();

			});

		});

	});

	it("should init good plugin", () => {

		return Promise.resolve().then(() => {

			strictEqual(pluginsManager.plugins.length, 0, "Loaded plugins length is no correct");

			return Promise.resolve();

		}).then(() => {

			return pluginsManager._initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

				strictEqual(plugin.core, true, "Loaded plugin core is no correct");

				strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin name is no correct");
				strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

				deepStrictEqual(plugin.authors, [ "Sébastien VIDAL" ], "Loaded plugin's authors are not correct");
				strictEqual(plugin.description, "A test for node-pluginsmanager", "Loaded plugin's description is not correct");

				strictEqual(plugin.license, "ISC", "Loaded plugin's license is not correct");
				strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin's name is not correct");

				strictEqual(plugin.version, "0.0.2", "Loaded plugin's version is not correct");

				return Promise.resolve();

			});

		});

	});

	describe("all", () => {

		afterEach(() => {

			return pluginsManager.releaseAll().then(() => {
				return pluginsManager.destroyAll();
			});

		});

		it("should init all", () => {

			return pluginsManager.initAll("test").then(() => {

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

				return Promise.resolve();

			});

		});

	});

});
