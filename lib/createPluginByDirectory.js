"use strict";

// deps

	// natives
	const { join, basename } = require("path");

	// externals
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));

// module

module.exports = function createPluginByDirectory (directory) {

	return isAbsoluteDirectory("createPluginByDirectory/directory", directory).then(() => {

		let Plugin = null;

		return Promise.resolve().then(() => {

			Plugin = require(directory);
			Plugin = Plugin.Orchestrator ? Plugin.Orchestrator : Plugin;

			return isFunction("createPluginByDirectory/directory", Plugin);

		}).then(() => {

			let plugin = null;
			plugin = new Plugin();
			plugin.name = basename(directory);

			return plugin.loadDataFromPackageFile().then(() => {
				return Promise.resolve(plugin);
			});

		});

	});

};
