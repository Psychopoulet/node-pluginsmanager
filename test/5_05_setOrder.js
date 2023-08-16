"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { deepStrictEqual, strictEqual } = require("node:assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / setOrder", () => {

	describe("params", () => {

		const pluginsManager = new PluginsManager({
			"directory": PLUGINS_DIRECTORY
		});

		it("should add empty order", (done) => {

			pluginsManager.setOrder().then(() => {
				done(new Error("Does not generate Error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an instance of Error");
				strictEqual(err instanceof ReferenceError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should add wrong order", (done) => {

			pluginsManager.setOrder(false).then(() => {
				done(new Error("Does not generate Error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an instance of Error");
				strictEqual(err instanceof TypeError, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should add normal order with wrong directories basenames", (done) => {

			pluginsManager.setOrder([ false, false ]).then(() => {
				done(new Error("Does not generate Error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an instance of Error");
				strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should add normal order with empty directories basenames", (done) => {

			pluginsManager.setOrder([ "", "" ]).then(() => {
				done(new Error("Does not generate Error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an instance of Error");
				strictEqual(err instanceof Error, true, "Generated error is not an instance of Error");

				done();

			});

		});

		it("should add normal order with normal directories basenames", () => {
			return pluginsManager.setOrder([ "test-good-plugin" ]);
		});

		it("should test normal run with order and twice the same plugin", (done) => {

			pluginsManager.setOrder([ "test-good-plugin", "test-good-plugin" ]).then(() => {
				done(new Error("Does not generate Error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "Generated error is not an object");
				strictEqual(err instanceof Error, true, "Generated error is not an Error");

				done();

			});

		});

	});

	describe("execute", () => {

		const pluginsManager = new PluginsManager({
			"directory": PLUGINS_DIRECTORY
		});

		afterEach(() => {

			pluginsManager.removeAllListeners();

			return pluginsManager.releaseAll().then(() => {
				return pluginsManager.destroyAll();
			});

		});

		it("should test normal load with order", () => {

			return pluginsManager.setOrder([ "test-good-plugin-without-dependencies" ]).then(() => {

				return new Promise((resolve, reject) => {

					let i = 0;
					pluginsManager.on("loaded", (plugin, data) => {

						if (0 === i) {
							strictEqual(plugin.name, "test-good-plugin-without-dependencies", "initialized plugins are incorrects");
						}
						else if (1 === i) {
							strictEqual(plugin.name, "test-good-plugin", "initialized plugins are incorrects");
						}

						++i;

						strictEqual(typeof data, "string", "Events data is not a string");
						strictEqual(data, EVENTS_DATA, "Events data is not as expected");

						(0, console).log("--- [PluginsManager/events/initialized] " + plugin.name + " - " + data);

					}).on("allloaded", (data) => {

						try {

							strictEqual(typeof data, "string", "Events data is not a string");
							strictEqual(data, EVENTS_DATA, "Events data is not as expected");

							resolve();

						}
						catch (e) {
							reject(e);
						}

					});

					pluginsManager.loadAll(EVENTS_DATA).catch(reject);

				});

			}).then(() => {

				return new Promise((resolve, reject) => {

					let i = 0;
					pluginsManager.on("initialized", (plugin, data) => {

						if (0 === i) {
							strictEqual(plugin.name, "test-good-plugin-without-dependencies", "initialized plugins are incorrects");
						}
						else if (1 === i) {
							strictEqual(plugin.name, "test-good-plugin", "initialized plugins are incorrects");
						}

						++i;

						strictEqual(typeof data, "string", "Events data is not a string");
						strictEqual(data, EVENTS_DATA, "Events data is not as expected");

						(0, console).log("--- [PluginsManager/events/initialized] " + plugin.name + " - " + data);

					}).on("allinitialized", (data) => {

						try {

							strictEqual(typeof data, "string", "Events data is not a string");
							strictEqual(data, EVENTS_DATA, "Events data is not as expected");

							resolve();

						}
						catch (e) {
							reject(e);
						}

					});

					pluginsManager.initAll(EVENTS_DATA).catch(reject);

				});

			}).then(() => {

				strictEqual(pluginsManager.plugins instanceof Array, true, "loaded plugins are incorrects");
				strictEqual(pluginsManager.plugins.length, 3, "loaded plugins are incorrects");

				// test-good-plugin

				strictEqual("object" === typeof pluginsManager.plugins[0], true, "loaded plugins are incorrects");

					strictEqual(
						pluginsManager.plugins[0].name, "test-good-plugin",
						"Loaded plugins' name are not correct"
					);

					deepStrictEqual(pluginsManager.plugins[0].authors, [ "Sébastien VIDAL" ], "loaded plugins are incorrects");

					deepStrictEqual(
						pluginsManager.plugins[0].dependencies, { "simpletts": "2.5.0" }, "loaded plugins are incorrects"
					);

					deepStrictEqual(
						pluginsManager.plugins[0].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
					);

					deepStrictEqual(pluginsManager.plugins[0].name, "test-good-plugin", "loaded plugins are incorrects");

				// test-good-plugin-without-dependencies

				strictEqual("object" === typeof pluginsManager.plugins[1], true, "loaded plugins are incorrects");

					strictEqual(
						pluginsManager.plugins[1].name, "test-good-plugin-with-default-export",
						"Loaded plugins' name are not correct"
					);

					deepStrictEqual(
						pluginsManager.plugins[1].authors, [ "Sébastien VIDAL", "test" ],
						"Loaded plugins' authors are not correct"
					);

					deepStrictEqual(pluginsManager.plugins[1].dependencies, { }, "loaded plugins are incorrects");
					deepStrictEqual(
						pluginsManager.plugins[1].description, "A test for node-pluginsmanager", "loaded plugins are incorrects"
					);

					deepStrictEqual(
						pluginsManager.plugins[1].name, "test-good-plugin-with-default-export", "loaded plugins are incorrects"
					);

			});

		});

		it("should test normal load with all plugins ordered", () => {

			return pluginsManager.setOrder([ "test-good-plugin-without-dependencies", "test-good-plugin" ]).then(() => {
				return pluginsManager.loadAll();
			}).then(() => {
				return pluginsManager.initAll();
			});

		});

	});

});
