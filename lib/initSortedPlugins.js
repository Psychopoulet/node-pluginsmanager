"use strict";

// private

	// methods

		/**
		* Load plugins with sort conditions
		* @param {object} plugin : plugin to init
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _initPlugin (plugin, emit, data) {

			emit("initializing", plugin, data);

			return plugin.init(data).then(() => {

				emit("initialized", plugin, data);

				return Promise.resolve();

			});

		}

		/**
		* Load plugins with sort conditions
		* @param {object} pluginsToInit : plugins to init
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _initPlugins (pluginsToInit, emit, data, i = 0) {

			return i < pluginsToInit.length ? Promise.resolve().then(() => {

				return _initPlugin(pluginsToInit[i], emit, data);

			// loop
			}).then(() => {

				return _initPlugins(pluginsToInit, emit, data, i + 1);

			}) : Promise.resolve();

		}

// module

module.exports = function initSortedPlugins (plugins, orderedPluginsNames, emit, data) {

	// if no plugins, does not run
	return !plugins.length ? Promise.resolve() : Promise.resolve().then(() => {

		const sortedPlugins = [
			...plugins.filter((plugin) => {
				return orderedPluginsNames.includes(plugin.name);
			})
		];

		// first, sorted plugins
		return sortedPlugins.length ?
			_initPlugins(sortedPlugins, emit, data) :
			Promise.resolve();

	}).then(() => {

		const unsortedPlugin = [
			...plugins.filter((plugin) => {
				return !orderedPluginsNames.includes(plugin.name);
			}).sort((a, b) => {

				if (a < b) {
					return -1;
				}
				else if (a > b) {
					return 1;
				}
				else {
					return 0;
				}

			})
		];

		// then, all other plugins, asynchronously
		return unsortedPlugin.length ?
			_initPlugins(unsortedPlugin, emit, data) :
			Promise.resolve();

	});

};
