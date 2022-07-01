"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// const

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / releaseAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	before(() => {
		return pluginsManager.loadAll();
	});

	after(() => {
		return pluginsManager.destroyAll();
	});

	it("should release all", () => {

		strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
		strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
		strictEqual(pluginsManager.plugins.length, 3, "plugins length is not valid");

		pluginsManager.plugins.forEach((plugin, key) => {
			strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
			strictEqual(plugin.initialized, false, "plugin \"" + key + "\" is not valid");
		});

		return pluginsManager.initAll().then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 3, "plugins length is not valid");

			pluginsManager.plugins.forEach((plugin, key) => {
				strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
				strictEqual(plugin.initialized, true, "plugin \"" + key + "\" is not valid");
			});

			return pluginsManager.releaseAll();

		}).then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 3, "plugins length is not valid");

			pluginsManager.plugins.forEach((plugin, key) => {
				strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
				strictEqual(plugin.initialized, false, "plugin \"" + key + "\" is not valid");
			});

		});

	});

	it("should test events", () => {

		return pluginsManager.initAll().then(() => {

			return new Promise((resolve, reject) => {

				pluginsManager.on("released", (plugin, data) => {

					strictEqual(typeof data, "string", "Events data is not a string");
					strictEqual(data, EVENTS_DATA, "Events data is not as expected");

					(0, console).log("--- [PluginsManager/events/released] " + plugin.name + " - " + data);

				}).on("allreleased", (data) => {

					try {

						strictEqual(typeof data, "string", "Events data is not a string");
						strictEqual(data, EVENTS_DATA, "Events data is not as expected");

						resolve();

					}
					catch (e) {
						reject(e);
					}

				});

				pluginsManager.releaseAll(EVENTS_DATA).catch(reject);

			});

		});

	});

});
