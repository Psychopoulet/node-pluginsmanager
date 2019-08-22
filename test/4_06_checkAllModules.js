/*
	eslint no-loop-func: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const { rmdirpProm } = require("node-promfs");

	// locals
	const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

// tests

describe("pluginsmanager / checkAllModules", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	it("should test normal check", () => {

		return pluginsManager.loadAll().then(() => {
			return pluginsManager.checkAllModules();
		}).then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test old module version", () => {

		const pluginName = "CopyTest";
		const pluginDirectory = join(pluginsManager.directory, pluginName);

		return copyPlugin(pluginsManager.directory, "TestGoodPlugin", pluginName, {
			"name": pluginName,
			"dependencies": {
				"simpletts": "2.3.0"
			}
		}).then(() => {

			return pluginsManager.loadAll();

		}).then(() => {

			const plugin = pluginsManager.plugins.filter((p) => {
				return pluginName === p.name;
			})[0] || null;

			return new Promise((resolve, reject) => {

				pluginsManager.checkModules(plugin).then(() => {
					reject(new Error("There is no generated Error"));
				}).catch(() => {
					resolve();
				});

			});

		}).then(() => {
			return pluginsManager.destroyAll();
		}).then(() => {
			return rmdirpProm(pluginDirectory);
		});

	}).timeout(MAX_TIMOUT);

});
