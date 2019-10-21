/*
	eslint max-params: 0
*/

"use strict";

// deps

	// natives
	const { join, basename } = require("path");

	// locals
	const createPluginByDirectory = require(join(__dirname, "createPluginByDirectory.js"));

// private

	// methods

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
		function _loadSortedPlugins (globalDirectory, externalRessourcesDirectory, files, plugins, emit, data, i = 0) {

			return i < files.length ? Promise.resolve().then(() => {

				const directory = join(globalDirectory, files[i]);

				const pluginName = basename(directory);

				// is already loaded ?
				const plugin = plugins.filter((p) => {
					return pluginName === p.name;
				})[0] || null;

				// is already exists ?
				return plugin ? Promise.resolve(plugin) : createPluginByDirectory(directory, externalRessourcesDirectory, data);

			// emit event
			}).then((plugin) => {

				emit("loaded", plugin, data);
				plugins.push(plugin);

				return Promise.resolve();

			// loop
			}).then(() => {

				return _loadSortedPlugins(globalDirectory, externalRessourcesDirectory, files, plugins, emit, data, i + 1);

			}) : Promise.resolve(plugins);

		}

// module

module.exports = _loadSortedPlugins;
