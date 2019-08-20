"use strict";

// deps

	// natives
	const { join, basename } = require("path");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "checkers", "isAbsoluteDirectory.js"));
	const isFunction = require(join(__dirname, "checkers", "isFunction.js"));
	const isOrchestrator = require(join(__dirname, "checkers", "isOrchestrator.js"));

// module

module.exports = function createPluginByDirectory (directory, externalRessourcesDirectory, data) {

	return isAbsoluteDirectory("createPluginByDirectory/directory", directory).then(() => {

		return isAbsoluteDirectory("createPluginByDirectory/externalRessourcesDirectory", externalRessourcesDirectory);

	}).then(() => {

		let Plugin = null;
		let plugin = null;

		const pluginBaseNameDirectory = basename(directory);

		return Promise.resolve().then(() => {

			Plugin = require(directory);
			Plugin = Plugin.Orchestrator ? Plugin.Orchestrator : Plugin;

			return isFunction("createPluginByDirectory/function", Plugin);

		}).then(() => {

			plugin = new Plugin({
				"externalRessourcesDirectory": join(externalRessourcesDirectory, pluginBaseNameDirectory)
			});

			return isOrchestrator("createPluginByDirectory/orchestrator", plugin);

		}).then(() => {

			plugin.name = pluginBaseNameDirectory;

			return plugin.load(data).then(() => {

				return plugin.name === pluginBaseNameDirectory ? Promise.resolve() : Promise.reject(new Error(
					"Plugin's name (\"" + plugin.name + "\") does not fit with plugin's directory basename (\"" + pluginBaseNameDirectory + "\")"
				));

			});

		}).then(() => {

			return Promise.resolve(plugin);

		});

	});

};
