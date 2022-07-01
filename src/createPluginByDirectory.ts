"use strict";

// deps

	// natives
	import { join, basename } from "path";
	import { checkFunction } from "node-pluginsmanager-plugin";

	// locals
	import checkOrchestrator from "./checkers/checkOrchestrator";
	import checkAbsoluteDirectory from "./checkers/checkAbsoluteDirectory";

// types & interfaces

	// natives
	import {  Orchestrator, tLogger } from "node-pluginsmanager-plugin";

// module

export default function createPluginByDirectory (directory: string, externalRessourcesDirectory: string, logger: tLogger | null): Promise<Orchestrator> {

	return checkAbsoluteDirectory("createPluginByDirectory/directory", directory).then((): Promise<void> => {
		return checkAbsoluteDirectory("createPluginByDirectory/externalRessourcesDirectory", externalRessourcesDirectory);
	}).then((): Promise<Orchestrator> => {

		return Promise.resolve().then((): Promise<Orchestrator> => {

			let Plugin: any = require(directory);

			if (Plugin.Orchestrator) {
				Plugin = Plugin.Orchestrator;
			}
			else if (Plugin.default) {
				Plugin = Plugin.default;
			}

			return checkFunction("createPluginByDirectory/function", Plugin).then((): Promise<Orchestrator> => {

				const pluginBaseNameDirectory: string = basename(directory);

				const plugin: Orchestrator = new Plugin({
					"externalRessourcesDirectory": join(externalRessourcesDirectory, pluginBaseNameDirectory),
					"logger": logger
				});

				return checkOrchestrator("createPluginByDirectory/orchestrator", plugin).then((): Promise<void> => {

					plugin.name = pluginBaseNameDirectory;

					return plugin.load().then((): Promise<void> => {

						return plugin.name === pluginBaseNameDirectory ? Promise.resolve() : Promise.reject(new Error(
							"Plugin's name (\"" + plugin.name + "\") does not fit with plugin's directory basename (\"" + pluginBaseNameDirectory + "\")"
						));

					});

				}).then((): Promise<Orchestrator> => {

					return Promise.resolve(plugin);

				});

			});

		});

	});

};
