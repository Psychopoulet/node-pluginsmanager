/*
	eslint no-loop-func: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const {
		readJSONFileProm, writeJSONFileProm,
		rmdirpProm
	} = require("node-promfs");

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

		const pluginName = "test";
		const pluginDirectory = join(pluginsManager.directory, pluginName);
		const pluginPackageFile = join(pluginDirectory, "package.json");

		return copyPlugin(pluginsManager.directory, "TestGoodPlugin", pluginName).then(() => {

			return readJSONFileProm(pluginPackageFile);

		}).then((data) => {

			data.name = pluginName;
			data.dependencies.simpletts = "2.3.0";

			return writeJSONFileProm(pluginPackageFile, data);

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
