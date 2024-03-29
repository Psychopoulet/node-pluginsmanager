"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { strictEqual } = require("node:assert");
	const { mkdir } = require("node:fs/promises");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));
	const checkAbsoluteDirectory = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkAbsoluteDirectory.js"));

// tests

describe("pluginsmanager / externalRessourcesDirectory", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should load all", () => {

		let directoryTested = "";

		return pluginsManager.loadAll().then(() => {

			return checkAbsoluteDirectory.default("externalRessourcesDirectory", pluginsManager.externalRessourcesDirectory);

		}).then(() => {

			pluginsManager.plugins.forEach((plugin) => {

				strictEqual(
					join(pluginsManager.externalRessourcesDirectory, plugin.name), plugin._externalRessourcesDirectory,
					"plugin's externalRessourcesDirectory is not valid"
				);

			});

			directoryTested = pluginsManager.plugins[0]._externalRessourcesDirectory;

		}).then(() => {

			return mkdir(directoryTested);

		}).then(() => {

			return checkAbsoluteDirectory.default("directoryTested", directoryTested);

		}).then(() => {

			return pluginsManager.destroyAll();

		}).then(() => {

			return new Promise((resolve, reject) => {

				checkAbsoluteDirectory.default("directoryTested", directoryTested).then(() => {
					reject(new Error("There is no generated error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "Generated error is not as expected");
					strictEqual(err instanceof Error, true, "Generated error is not as expected");

					resolve();

				});

			});

		});

	});

});
