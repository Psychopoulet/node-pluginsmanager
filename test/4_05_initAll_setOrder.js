"use strict";

// deps

	// natives
	const { join } = require("path");
	const { deepStrictEqual, strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / initAll & setOrder", () => {

	const pluginsManager = new PluginsManager({
		"directory": PLUGINS_DIRECTORY
	});

	afterEach(() => {

		pluginsManager.directory = PLUGINS_DIRECTORY;
		pluginsManager._orderedPluginsNames = [];

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should init without directory", (done) => {

		pluginsManager.directory = "";

		pluginsManager.initAll().then(() => {
			done(new Error("Inexistant directory used"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should add empty order", () => {

		return pluginsManager.setOrder().then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an instance of Error");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

			return Promise.resolve();

		});

	});

	it("should add wrong order", () => {

		return pluginsManager.setOrder(false).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an instance of Error");
			strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

			return Promise.resolve();

		});

	});

	it("should add normal order with wrong directories basenames", () => {

		return pluginsManager.setOrder([ false, false ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an instance of Error");
			strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

			return Promise.resolve();

		});

	});

	it("should add normal order with empty directories basenames", () => {

		return pluginsManager.setOrder([ "", "" ]).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an instance of Error");
			strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

			return Promise.resolve();

		});

	});

	it("should add normal order with normal directories basenames", () => {
		return pluginsManager.setOrder([ "TestGoodPlugin" ]);
	});

	it("should test normal init with order and twice the same plugin", (done) => {

		pluginsManager.setOrder([ "TestGoodPlugin", "TestGoodPlugin" ]).then(() => {
			done(new Error("Inexistant directory used"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not an object");
			strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test normal init with order", () => {

		return pluginsManager.setOrder([ "TestGoodPluginWithoutDependencies", "TestGoodPlugin" ]).then(() => {

			return new Promise((resolve, reject) => {

				let i = 0;
				pluginsManager.on("initialiazed", (plugin) => {

					try {

						if (0 === i) {
							strictEqual(plugin.name, "TestGoodPluginWithoutDependencies", "initialiazed plugins are incorrects");
							++i;
						}
						else if (1 === i) {
							strictEqual(plugin.name, "TestGoodPlugin", "initialiazed plugins are incorrects");
						}

					}
					catch (e) {
						reject(e);
					}

				}).on("allinitialiazed", resolve);

				pluginsManager.initAll().catch((err) => {
					reject(err);
				});

			});

		}).then(() => {

			strictEqual(pluginsManager.plugins instanceof Array, true, "initialiazed plugins are incorrects");
			strictEqual(pluginsManager.plugins.length, 2, "initialiazed plugins are incorrects");

			// TestGoodPlugin

			strictEqual("object" === typeof pluginsManager.plugins[0], true, "initialiazed plugins are incorrects");

				strictEqual(
					pluginsManager.plugins[0].name, "TestGoodPlugin",
					"Loaded plugins' name are not correct"
				);

				deepStrictEqual(pluginsManager.plugins[0].authors, [ "Sébastien VIDAL" ], "initialiazed plugins are incorrects");

				deepStrictEqual(
					pluginsManager.plugins[0].dependencies, { "simpletts": "2.4.0" }, "initialiazed plugins are incorrects"
				);

				deepStrictEqual(
					pluginsManager.plugins[0].description, "A test for node-pluginsmanager", "initialiazed plugins are incorrects"
				);

				deepStrictEqual(pluginsManager.plugins[0].name, "TestGoodPlugin", "initialiazed plugins are incorrects");

			// TestGoodPluginWithoutDependencies

			strictEqual("object" === typeof pluginsManager.plugins[1], true, "initialiazed plugins are incorrects");

				strictEqual(
					pluginsManager.plugins[1].name, "TestGoodPluginWithoutDependencies",
					"Loaded plugins' name are not correct"
				);

				deepStrictEqual(
					pluginsManager.plugins[1].authors, [ "Sébastien VIDAL", "test" ],
					"Loaded plugins' authors are not correct"
				);

				deepStrictEqual(pluginsManager.plugins[1].dependencies, { }, "initialiazed plugins are incorrects");
				deepStrictEqual(
					pluginsManager.plugins[1].description, "A test for node-pluginsmanager", "initialiazed plugins are incorrects"
				);

				deepStrictEqual(
					pluginsManager.plugins[1].name, "TestGoodPluginWithoutDependencies", "initialiazed plugins are incorrects"
				);

			return Promise.resolve();

		});

	});

});
