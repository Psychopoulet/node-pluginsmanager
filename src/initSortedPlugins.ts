"use strict";

// types & interfaces

	// natives
	import {  Orchestrator } from "node-pluginsmanager-plugin";

// private

	// methods

		function _initPlugin (plugin: Orchestrator, emit: (eventName: string, ...subdata: any) => void, ...data: any): Promise<void> {

			emit("initializing", plugin, ...data);

			return plugin.init(...data).then((): Promise<void> => {

				emit("initialized", plugin, ...data);

				return Promise.resolve();

			});

		}

		function _initPlugins (pluginsToInit: Array<Orchestrator>, emit: (eventName: string, ...subdata: any) => void, data: Array<any>, i: number = 0): Promise<void> {

			return i < pluginsToInit.length ? Promise.resolve().then((): Promise<void> => {

				return _initPlugin(pluginsToInit[i], emit, ...data);

			// loop
			}).then((): Promise<void> => {

				return _initPlugins(pluginsToInit, emit, data, i + 1);

			}) : Promise.resolve();

		}

// module

export default function initSortedPlugins (
	plugins: Array<Orchestrator>, orderedPluginsNames: Array<string>,
	emit: (eventName: string, ...subdata: any) => void, ...data: any
): Promise<void> {

	// if no plugins, does not run
	return !plugins.length ? Promise.resolve() : Promise.resolve().then((): Promise<void> => {

		const sortedPlugins: Array<Orchestrator> = [
			...plugins.filter((plugin): boolean => {
				return orderedPluginsNames.includes(plugin.name);
			})
		];

		// first, sorted plugins
		return sortedPlugins.length ?
			_initPlugins(sortedPlugins, emit, data) :
			Promise.resolve();

	}).then((): Promise<void> => {

		const unsortedPlugin: Array<Orchestrator> = [
			...plugins.filter((plugin: Orchestrator): boolean => {
				return !orderedPluginsNames.includes(plugin.name);
			}).sort((a: Orchestrator, b: Orchestrator): -1 | 0 | 1 => {

				if (a.name < b.name) {
					return -1;
				}
				else if (a.name > b.name) {
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
