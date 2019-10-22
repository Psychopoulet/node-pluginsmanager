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
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _loadPlugin (globalDirectory, externalRessourcesDirectory, pluginName, plugins, emit, data) {

			// is already loaded ?
			const plugin = plugins.find((p) => {
				return pluginName === p.name;
			});

			// is already exists ?
			return plugin ? Promise.resolve() : Promise.resolve().then(() => {

				const directory = join(globalDirectory, pluginName);

				return createPluginByDirectory(directory, externalRessourcesDirectory, data);

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
		* @param {object} plugins : already loaded plugins
		* @param {string} orderedPluginsNames : order for load
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _loadSortedPlugins (globalDirectory, externalRessourcesDirectory, plugins, orderedPluginsNames, emit, data, i = 0) {

			return i < orderedPluginsNames.length ? Promise.resolve().then(() => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, orderedPluginsNames[i], plugins, emit, data);

			// loop
			}).then(() => {

				return _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, plugins, orderedPluginsNames, emit, data, i + 1);

			}) : Promise.resolve();

		}

		/**
		* Load plugins with sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {Array} files : files to load
		* @param {object} plugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _loadAllPlugins (globalDirectory, externalRessourcesDirectory, files, plugins, emit, data, i = 0) {

			return i < files.length ? Promise.resolve().then(() => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, files[i], plugins, emit, data);

			// loop
			}).then(() => {

				return _loadAllPlugins(globalDirectory, externalRessourcesDirectory, files, plugins, emit, data, i + 1);

			}) : Promise.resolve();

		}

// module

module.exports = (globalDirectory, externalRessourcesDirectory, files, plugins, orderedPluginsNames, emit, data) => {

	return !files.length ? Promise.resolve() : Promise.resolve().then(() => {

		return !orderedPluginsNames.length ? Promise.resolve() :
			_loadSortedPlugins(globalDirectory, externalRessourcesDirectory, plugins, orderedPluginsNames, emit, data);

	}).then(() => {

		return _loadAllPlugins(globalDirectory, externalRessourcesDirectory, files, plugins, emit, data);

	});

};
