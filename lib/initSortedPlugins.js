"use strict";

// consts

	const MAX_PARALLEL = 5;

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
		function _initSortedPlugins (pluginsToInit, emit, data, i = 0) {

			return i < pluginsToInit.length ? Promise.resolve().then(() => {

				return _initPlugin(pluginsToInit[i], emit, data);

			// loop
			}).then(() => {

				return _initSortedPlugins(pluginsToInit, emit, data, i + 1);

			}) : Promise.resolve();

		}

		/**
		* Load plugins without sort conditions
		* @param {object} pluginsToInit : plugins to init
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @return {Promise} : result operation
		*/
		function _initUnSortedPlugins (pluginsToInit, emit, data) {

			return pluginsToInit.length ? Promise.all(pluginsToInit.splice(0, MAX_PARALLEL).map((p) => {

				return _initPlugin(p, emit, data);

			// loop
			})).then(() => {

				return _initUnSortedPlugins(pluginsToInit, emit, data);

			}) : Promise.resolve();

		}

// module

module.exports = function initSortedPlugins (plugins, orderedPluginsNames, emit, data){

	// if no plugins, does not run
	return !plugins.length ? Promise.resolve() : Promise.resolve().then(() => {

		const sortedPlugins = [ ...plugins.filter((plugin) => {
			return orderedPluginsNames.includes(plugin.name);
		}) ];

		// first, sorted plugins
		return sortedPlugins.length ? _initSortedPlugins(sortedPlugins, emit, data) : Promise.resolve();

	}).then(() => {

		const unsortedPlugin = [ ...plugins.filter((plugin) => {
			return !orderedPluginsNames.includes(plugin.name);
		}) ];

		// then, all other plugins, asynchronously
		return unsortedPlugin.length ? _initUnSortedPlugins(unsortedPlugin, emit, data) : Promise.resolve();

	});

};
