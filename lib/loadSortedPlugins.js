/*
	eslint max-params: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const createPluginByDirectory = require(join(__dirname, "createPluginByDirectory.js"));

// private

	// methods

		/**
		* Load plugins with sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {string} pluginName : get ressources directory
		* @param {object} plugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {function|null} logger : if logger, send it to plugin
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _loadPlugin (globalDirectory, externalRessourcesDirectory, pluginName, plugins, emit, logger, data) {

			// is already loaded ?
			const plugin = plugins.find((p) => {
				return pluginName === p.name;
			});

			// is already exists ?
			return plugin ? Promise.resolve() : Promise.resolve().then(() => {

				const directory = join(globalDirectory, pluginName);

				return createPluginByDirectory(directory, externalRessourcesDirectory, logger, data);

			// emit event
			}).then((createdPlugin) => {

				emit("loaded", createdPlugin, data);
				plugins.push(createdPlugin);

				return Promise.resolve();

			});

		}

		/**
		* Load plugins with sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {Array} toLoad : plugins to load
		* @param {object} plugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {function|null} logger : if logger, send it to plugin
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _loadSortedPlugins (globalDirectory, externalRessourcesDirectory, toLoad, plugins, emit, logger, data, i = 0) {

			return i < toLoad.length ? Promise.resolve().then(() => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, toLoad[i], plugins, emit, logger, data);

			// loop
			}).then(() => {

				return _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, toLoad, plugins, emit, logger, data, i + 1);

			}) : Promise.resolve();

		}

// module

module.exports = (globalDirectory, externalRessourcesDirectory, files, plugins, orderedPluginsNames, emit, logger, data) => {

	// if no files, does not run
	return !files.length ? Promise.resolve() : Promise.resolve().then(() => {

		// first, sorted plugins
		return _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, orderedPluginsNames, plugins, emit, logger, data);

	}).then(() => {

		// then, all other plugins, asynchronously
		return Promise.all(files.filter((pluginName) => {
			return !orderedPluginsNames.includes(pluginName);
		}).map((file) => {

			return _loadPlugin(globalDirectory, externalRessourcesDirectory, file, plugins, emit, logger, data);

		}));

	});

};
