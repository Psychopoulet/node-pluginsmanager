"use strict";

// deps

	// natives
	const { join } = require("path");
	const { deepStrictEqual, strictEqual } = require("assert");

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

	afterEach(() => {
		return pluginsManager.releaseAll();
	});

	it("should init good plugin", () => {

		return Promise.resolve().then(() => {

			strictEqual(pluginsManager.plugins.length, 0, "Loaded plugins length is no correct");

			return Promise.resolve();

		}).then(() => {

			return pluginsManager.initByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

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

	it("should release good plugin", () => {

		return Promise.resolve().then(() => {

			strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

			return Promise.resolve();

		}).then(() => {

			if (0 < pluginsManager.plugins.length) {

				return pluginsManager.plugins[0].release("test").then(() => {
					pluginsManager.plugins.splice(0, 1); return Promise.resolve();
				});

			}
			else {
				return Promise.resolve();
			}

		});

	});

	it("should init all", () => {

		return pluginsManager.initAll("test").then(() => {

			strictEqual(pluginsManager.plugins.length, 2, "Loaded plugins length is no correct");

			return Promise.resolve();

		});

	});

});
