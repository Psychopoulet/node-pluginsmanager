"use strict";

// deps

	// natives
	import { join } from "node:path";

	// locals
	import createPluginByDirectory from "./createPluginByDirectory";

// types & interfaces

	import { Orchestrator, tLogger } from "node-pluginsmanager-plugin";

// private

	// methods

		function _loadPlugin (
			globalDirectory: string, externalRessourcesDirectory: string,
			pluginFileName: string, loadedPlugins: Array<Orchestrator>,
			emit: (eventName: string, ...subdata: any) => void, logger: tLogger | null, ...data: any
		): Promise<void> {

			// is already loaded ?
			const plugin: Orchestrator | undefined = loadedPlugins.find((p: Orchestrator): boolean => {
				return pluginFileName === p.name;
			});

			// is already exists ?
			return plugin ? Promise.resolve() : Promise.resolve().then((): Promise<Orchestrator> => {

				emit("loading", pluginFileName, ...data);

				const directory: string = join(globalDirectory, pluginFileName);

				return createPluginByDirectory(directory, externalRessourcesDirectory, logger, ...data);

			// emit event
			}).then((createdPlugin: Orchestrator): Promise<void> => {

				emit("loaded", createdPlugin, ...data);
				loadedPlugins.push(createdPlugin);

				return Promise.resolve();

			});

		}

		function _loadPlugins (
			globalDirectory: string, externalRessourcesDirectory: string,
			pluginsToLoad: Array<string>, loadedPlugins: Array<Orchestrator>,
			emit: (eventName: string, ...subdata: any) => void, logger: tLogger | null, data: Array<any>, i: number = 0
		): Promise<void> {

			return i < pluginsToLoad.length ? Promise.resolve().then((): Promise<void> => {

				return _loadPlugin(globalDirectory, externalRessourcesDirectory, pluginsToLoad[i], loadedPlugins, emit, logger, ...data);

			// loop
			}).then((): Promise<void> => {

				return _loadPlugins(globalDirectory, externalRessourcesDirectory, pluginsToLoad, loadedPlugins, emit, logger, data, i + 1);

			}) : Promise.resolve();

		}

// module

export default function loadSortedPlugins (
	globalDirectory: string, externalRessourcesDirectory: string,
	files: Array<string>, loadedPlugins: Array<Orchestrator>, orderedPluginsNames: Array<string>,
	emit: (eventName: string, ...subdata: any) => void, logger: tLogger | null, ...data: any
): Promise<void> {

	// if no files, does not run
	return !files.length ? Promise.resolve() : Promise.resolve().then((): Promise<void> => {

		const sortedPluginsNames: Array<string> = [];
		orderedPluginsNames.forEach((pluginName: string): void => {

			const plugin: string | undefined = files.find((p: string): boolean => {
				return p === pluginName;
			});

			if (plugin) {
				sortedPluginsNames.push(pluginName);
			}

		});

		// first, sorted plugins
		return sortedPluginsNames.length ?
			_loadPlugins(globalDirectory, externalRessourcesDirectory, sortedPluginsNames, loadedPlugins, emit, logger, data) :
			Promise.resolve();

	}).then((): Promise<void> => {

		const unsortedPluginsNames: Array<string> = [
			...files.filter((pluginName: string): boolean => {
				return !orderedPluginsNames.includes(pluginName);
			}).sort((a: string, b: string): -1 | 0 | 1 => {

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
		return unsortedPluginsNames.length ?
			_loadPlugins(globalDirectory, externalRessourcesDirectory, unsortedPluginsNames, loadedPlugins, emit, logger, data) :
			Promise.resolve();

	});

};
