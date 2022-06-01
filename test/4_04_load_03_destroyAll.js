"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / destroyAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should destroy all", () => {

		strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
		strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
		strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

		return pluginsManager.loadAll().then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 3, "plugins length is not valid");

			pluginsManager.plugins.forEach((plugin, key) => {
				strictEqual(plugin.enabled, true, "plugin \"" + key + "\" is not valid");
				strictEqual(plugin.initialized, false, "plugin \"" + key + "\" is not valid");
			});

			return pluginsManager.destroyAll();

		}).then(() => {

			strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
			strictEqual(pluginsManager.plugins instanceof Array, true, "plugins is not an Array");
			strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

		});

	});

	it("should test events", () => {

		return pluginsManager.loadAll().then(() => {

			return new Promise((resolve, reject) => {

				pluginsManager.on("destroyed", (pluginName, data) => {

					strictEqual(typeof data, "string", "Events data is not a string");
					strictEqual(data, EVENTS_DATA, "Events data is not as expected");

					(0, console).log("--- [PluginsManager/events/destroyed] " + pluginName + " - " + data);

				}).on("alldestroyed", (data) => {

					try {

						strictEqual(typeof data, "string", "Events data is not a string");
						strictEqual(data, EVENTS_DATA, "Events data is not as expected");

						resolve();

					}
					catch (e) {
						reject(e);
					}

				});

				pluginsManager.destroyAll(EVENTS_DATA).catch(reject);

			});

		});

	});

});
