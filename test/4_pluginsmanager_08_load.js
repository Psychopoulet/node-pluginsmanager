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

describe("pluginsmanager / load", () => {

	const pluginsManager = new PluginsManager();

	before(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
		return pluginsManager.unloadAll();
	});

	after(() => {
		return pluginsManager.unloadAll();
	});

	it("should load good plugin", () => {

		return new Promise((resolve) => {

			assert.strictEqual(pluginsManager.plugins.length, 0, "Loaded plugins length is no correct");
			resolve();

		}).then(() => {

			return pluginsManager.loadByDirectory(GOOD_PLUGIN_DIRECTORY).then((plugin) => {

				assert.strictEqual(plugin.core, true, "Loaded plugin core is no correct");

				assert.strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin name is no correct");
				assert.strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

				assert.deepStrictEqual(plugin.authors, [ "Sébastien VIDAL" ], "Loaded plugin's authors are not correct");
				assert.strictEqual(plugin.description, "A test for node-pluginsmanager", "Loaded plugin's description is not correct");

				assert.deepStrictEqual(
					plugin.designs,
					[ join(GOOD_PLUGIN_DIRECTORY, "design.css") ],
					"Loaded plugin's designs is not correct"
				);

				assert.strictEqual(
					plugin.directory, GOOD_PLUGIN_DIRECTORY, "Loaded plugin's directory is not correct"
				);

				assert.strictEqual(plugin.github, "", "Loaded plugin's github is not correct");

				assert.deepStrictEqual(
					plugin.javascripts,
					[ join(GOOD_PLUGIN_DIRECTORY, "javascript.js") ],
					"Loaded plugin's javascripts is not correct"
				);

				assert.strictEqual(plugin.license, "ISC", "Loaded plugin's license is not correct");
				assert.strictEqual(plugin.name, "TestGoodPlugin", "Loaded plugin's name is not correct");

				assert.deepStrictEqual(
					plugin.templates,
					[ join(GOOD_PLUGIN_DIRECTORY, "template.html") ],
					"Loaded plugin's templates is not correct"
				);

				assert.strictEqual(plugin.version, "0.0.2", "Loaded plugin's version is not correct");

			});

		});

	});

	it("should unload good plugin", () => {

		return new Promise((resolve) => {

			assert.strictEqual(pluginsManager.plugins.length, 1, "Loaded plugins length is no correct");

			resolve();

		}).then(() => {

			if (0 < pluginsManager.plugins.length) {

				return pluginsManager.plugins[0].unload("test").then(() => {
					pluginsManager.plugins.splice(0, 1); return Promise.resolve();
				});

			}
			else {
				return Promise.resolve();
			}

		});

	});

	it("should load all", () => {

		return pluginsManager.loadAll("test").then(() => {
			assert.strictEqual(pluginsManager.plugins.length, 2, "Loaded plugins length is no correct");
		});

	});

});
