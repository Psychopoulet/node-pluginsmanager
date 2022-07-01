"use strict";

// deps

	// natives
	import { join, basename } from "path";

	// locals
	import checkAbsoluteDirectory from "./checkers/checkAbsoluteDirectory";
	import checkOrchestrator from "./checkers/checkOrchestrator";
	import checkFunction from "./checkers/checkFunction";

// types & interfaces

	// natives
	import { Orchestrator, tLogger } from "node-pluginsmanager-plugin";

	// locals

	type tMultiExportPlugin = { "Orchestrator": typeof Orchestrator; };
	type tDefaultExportPlugin = { "default": typeof Orchestrator; };

// module

export default function createPluginByDirectory (directory: string, externalRessourcesDirectory: string, logger: tLogger | null): Promise<Orchestrator> {

	return checkAbsoluteDirectory("createPluginByDirectory/directory", directory).then((): Promise<void> => {
		return checkAbsoluteDirectory("createPluginByDirectory/externalRessourcesDirectory", externalRessourcesDirectory);
	}).then((): Promise<Orchestrator> => {

		return new Promise((resolve: (value: tMultiExportPlugin | tDefaultExportPlugin | typeof Orchestrator) => void, reject: (err: Error) => void): void => {

			try {
				resolve(require(directory) as tMultiExportPlugin | tDefaultExportPlugin | typeof Orchestrator);
			}
			catch (e) {
				reject(e as Error);
			}

		}).then((Plugin:tMultiExportPlugin | tDefaultExportPlugin | typeof Orchestrator): Promise<typeof Orchestrator> => {

			if ((Plugin as tMultiExportPlugin).Orchestrator) {
				return Promise.resolve((Plugin as tMultiExportPlugin).Orchestrator);
			}
			else if ((Plugin as tDefaultExportPlugin).default) {
				return Promise.resolve((Plugin as tDefaultExportPlugin).default);
			}
			else {
				return Promise.resolve(Plugin as typeof Orchestrator);
			}

		}).then((Plugin: typeof Orchestrator): Promise<Orchestrator> => {

			return checkFunction("createPluginByDirectory/function", Plugin).then((): Promise<Orchestrator> => {

				const pluginBaseNameDirectory: string = basename(directory);

				const plugin: Orchestrator = new Plugin({

					// usefull for inherited Orchestrators
					"externalRessourcesDirectory": join(externalRessourcesDirectory, pluginBaseNameDirectory),
					"logger": logger as tLogger,

					// useless, setted in inherited Orchestrators
					"packageFile": "",
					"descriptorFile": "",
					"mediatorFile": "",
					"serverFile": ""

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
