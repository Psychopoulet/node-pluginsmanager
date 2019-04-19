"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / loadAll & setOrder", () => {

	const pluginsManager = new PluginsManager();

	beforeEach(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
		return pluginsManager.unloadAll();
	});

	afterEach(() => {
		pluginsManager._orderedDirectoriesBaseNames = [];
		return pluginsManager.unloadAll();
	});

	it("should load without directory", (done) => {

		const saveDirectory = pluginsManager.directory;
		pluginsManager.directory = "";

		pluginsManager.loadAll().then(() => {
			done(new Error("Inexistant directory used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			pluginsManager.directory = saveDirectory;

			done();

		});

	});

	it("should add empty order", () => {

		return pluginsManager.setOrder().then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				assert.strictEqual(err.message, "This is not an array", "this is not the expected message");

				resolve();

			});

		});

	});

	it("should add wrong order", () => {

		return pluginsManager.setOrder(false).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				assert.strictEqual(err.message, "This is not an array", "this is not the expected message");

				resolve();

			});

		});

	});

	it("should add normal order with wrong directories basenames", () => {

		return pluginsManager.setOrder([ false, false ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				assert.strictEqual(
					err.message,
					"The directory at index \"0\" must be a string\r\nThe directory at index \"1\" must be a string",
					"this is not the expected message"
				);

				resolve();

			});

		});

	});

	it("should add normal order with empty directories basenames", () => {

		return pluginsManager.setOrder([ "", "" ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				assert.strictEqual(
					err.message,
					"The directory at index \"0\" must be not empty\r\nThe directory at index \"1\" must be not empty",
					"this is not the expected message"
				);

				resolve();

			});

		});

	});

	it("should add normal order with normal directories basenames", () => {
		return pluginsManager.setOrder([ "TestGoodPlugin" ]);
	});

	it("should test normal loading with order and twice the same plugin", () => {

		return pluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPlugin" ]).then(() => {
			return pluginsManager.loadAll();
		}).then(() => {

			assert.strictEqual(pluginsManager.plugins.length, 2, "too much plugins loaded");

			return Promise.resolve();

		});

	});

	it("should test normal loading with order", () => {

		return pluginsManager.setOrder([ "TestGoodPluginWithoutDependencies", "TestGoodPlugin" ]).then(() => {

			let i = 0;
			pluginsManager.on("load", (plugin) => {

				if (0 === i) {
					assert.strictEqual(plugin.name, "TestGoodPluginWithoutDependencies", "loaded plugins are incorrects");
				}
				else if (1 === i) {
					assert.strictEqual(plugin.name, "TestGoodPlugin", "loaded plugins are incorrects");
				}

				++i;

			});

			return Promise.resolve();

		}).then(() => {
			return pluginsManager.loadAll();
		}).then(() => {

			return new Promise((resolve) => {

				assert.strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
				assert.strictEqual(pluginsManager.plugins.length, 2, "loaded plugins are incorrects");

				// TestGoodPlugin

				assert.strictEqual("object" === typeof pluginsManager.plugins[0], true, "loaded plugins are incorrects");
					assert.deepStrictEqual(pluginsManager.plugins[0].authors, [ "Sébastien VIDAL" ], "loaded plugins are incorrects");

					assert.deepStrictEqual(
						pluginsManager.plugins[0].dependencies, { "simpletts": "^1.4.1" }, "loaded plugins are incorrects"
					);

					assert.deepStrictEqual(
						pluginsManager.plugins[0].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
					);

					assert.deepStrictEqual(pluginsManager.plugins[0].name, "TestGoodPlugin", "loaded plugins are incorrects");

				// TestGoodPluginWithoutDependencies

				assert.strictEqual("object" === typeof pluginsManager.plugins[1], true, "loaded plugins are incorrects");

					assert.deepStrictEqual(
						pluginsManager.plugins[1].authors, [ "Sébastien VIDAL", "test" ],
						"Loaded plugins' authors are not correct"
					);

					assert.deepStrictEqual(pluginsManager.plugins[1].dependencies, { }, "loaded plugins are incorrects");
					assert.deepStrictEqual(
						pluginsManager.plugins[1].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
					);

					assert.deepStrictEqual(
						pluginsManager.plugins[1].name, "TestGoodPluginWithoutDependencies", "loaded plugins are incorrects"
					);

				resolve();

			});

		});

	});

});
