/*
	eslint max-params: 0
*/

"use strict";

// private

	// methods

		/**
		* Load plugins with sort conditions
		* @param {string} pluginName : get ressources directory
		* @param {object} plugins : already inited plugins
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _initPlugin (pluginName, plugins, emit, data) {

			// is already inited ?
			const plugin = plugins.find((p) => {
				return pluginName === p.name;
			});

			// is already exists ?
			return !plugin || plugin.initialized ? Promise.resolve() : Promise.resolve().then(() => {

				return plugin.init(data);

			// emit event
			}).then(() => {

				emit("initialized", plugin, data);

				return Promise.resolve();

			});

		}

		/**
		* Load plugins with sort conditions
		* @param {object} plugins : already inited plugins
		* @param {string} orderedPluginsNames : order for init
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _initSortedPlugins (plugins, orderedPluginsNames, emit, data, i = 0) {

			return i < orderedPluginsNames.length ? Promise.resolve().then(() => {

				return _initPlugin(orderedPluginsNames[i], plugins, emit, data);

			// loop
			}).then(() => {

				return _initSortedPlugins(plugins, orderedPluginsNames, emit, data, i + 1);

			}) : Promise.resolve();

		}

		/**
		* Load plugins with sort conditions
		* @param {object} plugins : already inited plugins
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _initAllPlugins (plugins, emit, data, i = 0) {

			return i < plugins.length ? Promise.resolve().then(() => {

				return _initPlugin(plugins[i].name, plugins, emit, data);

			// loop
			}).then(() => {

				return _initAllPlugins(plugins, emit, data, i + 1);

			}) : Promise.resolve();

		}

// module

module.exports = (plugins, orderedPluginsNames, emit, data) => {

	return !plugins.length ? Promise.resolve() : Promise.resolve().then(() => {

		return !orderedPluginsNames.length ? Promise.resolve() :
			_initSortedPlugins(plugins, orderedPluginsNames, emit, data);

	}).then(() => {

		return _initAllPlugins(plugins, emit, data);

	});

};
