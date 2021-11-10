"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");
	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / loadAll", () => {

	describe("params", () => {

		describe("directory", () => {

			it("should test without directory", (done) => {

				const pluginsManager = new PluginsManager();

					delete pluginsManager.directory;

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

					done();

				});

			});

			it("should test with wrong directory", (done) => {

				const pluginsManager = new PluginsManager({
					"directory": false
				});

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

					done();

				});

			});

			it("should test with empty directory", (done) => {

				const pluginsManager = new PluginsManager({
					"directory": ""
				});

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof Error, true, "Generated error is not as expected");

					done();

				});

			});

		});

		describe("externalRessourcesDirectory", () => {

			it("should test without externalRessourcesDirectory", (done) => {

				const pluginsManager = new PluginsManager({
					"directory": PLUGINS_DIRECTORY
				});

					delete pluginsManager.externalRessourcesDirectory;

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

					done();

				});

			});

			it("should test with wrong externalRessourcesDirectory", (done) => {

				const pluginsManager = new PluginsManager({
					"directory": PLUGINS_DIRECTORY,
					"externalRessourcesDirectory": false
				});

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

					done();

				});

			});

			it("should test with empty externalRessourcesDirectory", (done) => {

				const pluginsManager = new PluginsManager({
					"directory": PLUGINS_DIRECTORY,
					"externalRessourcesDirectory": ""
				});

				pluginsManager.loadAll().then(() => {
					done(new Error("Does not generate Error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof Error, true, "Generated error is not as expected");

					done();

				});

			});

		});

	});

	describe("execute", () => {

		const pluginsManager = new PluginsManager({
			"directory": PLUGINS_DIRECTORY
		});

		afterEach(() => {
			return pluginsManager.destroyAll();
		});

		it("should load all", () => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

			return pluginsManager.loadAll().then(() => {

				strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
				strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
				strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

			});

		});

		it("should test events", () => {

			return new Promise((resolve, reject) => {

				pluginsManager.on("loading", (pluginName, data) => {

					strictEqual(typeof pluginName, "string", "Events pluginName is not a string");

					strictEqual(typeof data, "string", "Events data is not a string");
					strictEqual(data, EVENTS_DATA, "Events data is not as expected");

					(0, console).log("--- [PluginsManager/events/loading] " + pluginName + " - " + data);

				}).on("loaded", (plugin, data) => {

					strictEqual(typeof plugin, "object", "Events plugin is not an object");

					strictEqual(typeof data, "string", "Events data is not a string");
					strictEqual(data, EVENTS_DATA, "Events data is not as expected");

					(0, console).log("--- [PluginsManager/events/loaded] " + plugin.name + " - " + data);

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

		});

	});

});
