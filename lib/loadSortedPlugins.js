/*
	eslint max-params: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const createPluginByDirectory = require(join(__dirname, "createPluginByDirectory.js"));

// consts

	const MAX_PARALLEL = 5;

// private

	// methods

		/**
		* Load plugins with sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {string} pluginFileName : get ressources directory
		* @param {object} loadedPlugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {function|null} logger : if logger, send it to plugin
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _loadPlugin (globalDirectory, externalRessourcesDirectory, pluginFileName, loadedPlugins, emit, logger, data) {

			// is already loaded ?
			const plugin = loadedPlugins.find((p) => {
				return pluginFileName === p.name;
			});

			// is already exists ?
			return plugin ? Promise.resolve() : Promise.resolve().then(() => {

				emit("loading", pluginFileName, data);

				const directory = join(globalDirectory, pluginFileName);

				return createPluginByDirectory(directory, externalRessourcesDirectory, logger, data);

			// emit event
			}).then((createdPlugin) => {

				emit("loaded", createdPlugin, data);
				loadedPlugins.push(createdPlugin);

				return Promise.resolve();

			});

		}

		/**
		* Load plugins with sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {Array} pluginsToLoad : plugins to load
		* @param {object} loadedPlugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {function|null} logger : if logger, send it to plugin
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _loadSortedPlugins (globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data, i = 0) {

			return i < pluginsToLoad.length ? Promise.resolve().then(() => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, pluginsToLoad[i], loadedPlugins, emit, logger, data);

			// loop
			}).then(() => {

				return i + 1 < pluginsToLoad.length ? _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data, i + 1) : Promise.resolve();

			}) : Promise.resolve();

		}

		/**
		* Load plugins without sort conditions
		* @param {string} globalDirectory : get plugins directory
		* @param {string} externalRessourcesDirectory : get ressources directory
		* @param {Array} pluginsToLoad : plugins to load
		* @param {object} loadedPlugins : already loaded plugins
		* @param {function} emit : emit data function
		* @param {function|null} logger : if logger, send it to plugin
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _loadUnSortedPlugins (globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data) {

			return pluginsToLoad.length ? Promise.all(pluginsToLoad.splice(0, MAX_PARALLEL).map((p) => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, p, loadedPlugins, emit, logger, data);

			})).then(() => {

				return pluginsToLoad.length ? _loadUnSortedPlugins(globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data) : Promise.resolve();

			}) : Promise.resolve();

		}

// module

module.exports = function loadSortedPlugins (globalDirectory, externalRessourcesDirectory, files, loadedPlugins, sortedPluginsNames, emit, logger, data) {

	// if no files, does not run
	return !files.length ? Promise.resolve() : Promise.resolve().then(() => {

		// first, sorted plugins
		return sortedPluginsNames.length ? _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, [ ...sortedPluginsNames ], loadedPlugins, emit, logger, data) : Promise.resolve();

	}).then(() => {

		const unsortedPluginsNames = [ ...files.filter((pluginName) => {
			return !sortedPluginsNames.includes(pluginName);
		}) ];

		// then, all other plugins, asynchronously
		return unsortedPluginsNames.length ? _loadUnSortedPlugins(globalDirectory, externalRessourcesDirectory, unsortedPluginsNames, loadedPlugins, emit, logger, data) : Promise.resolve();

	});

};
