"use strict";

// deps

	// natives
	const { join, basename } = require("path");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isOrchestrator = require(join(__dirname, "checkers", "isOrchestrator.js"));

// module

module.exports = function createPluginByDirectory (directory) {

	return isAbsoluteDirectory("createPluginByDirectory/directory", directory).then(() => {

		let Plugin = null;
		let plugin = null;

		return Promise.resolve().then(() => {

			Plugin = require(directory);
			Plugin = Plugin.Orchestrator ? Plugin.Orchestrator : Plugin;

			return isFunction("createPluginByDirectory/function", Plugin);

		}).then(() => {

			plugin = new Plugin();

			return isOrchestrator("createPluginByDirectory/orchestrator", plugin);

		}).then(() => {

			plugin.name = basename(directory);

			return plugin.loadDataFromPackageFile();

		}).then(() => {
			return Promise.resolve(plugin);
		});

	});

};
