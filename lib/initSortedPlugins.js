/*
	eslint max-params: 0
*/

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

			return plugin.init(data).then(() => {

				emit("initialized", plugin, data);

				return Promise.resolve();

			});

		}

		/**
		* Load plugins with sort conditions
		* @param {object} toLoad : plugins to init
		* @param {function} emit : emit data function
		* @param {object} data : data to send
		* @param {number} i : stepper
		* @return {Promise} : result operation
		*/
		function _initPlugins (toLoad, emit, data, i = 0) {

			return i < toLoad.length ? Promise.resolve().then(() => {

				return _initPlugin(toLoad[i], emit, data);

			// loop
			}).then(() => {

				return _initPlugins(toLoad, emit, data, i + 1);

			}) : Promise.resolve();

		}

// module

module.exports = (plugins, orderedPluginsNames, emit, data) => {

	return !plugins.length ? Promise.resolve() : Promise.resolve().then(() => {

		return _initPlugins(orderedPluginsNames.map((pluginName) => {

			return plugins.find((plugin) => {
				return plugin.name === pluginName;
			});

		}), emit, data);

	}).then(() => {

		return _initPlugins(plugins.filter((plugin) => {
			return !orderedPluginsNames.includes(plugin.name);
		}), emit, data);

	});

};
