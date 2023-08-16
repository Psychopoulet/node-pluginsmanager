/// <reference path="../../lib/cjs/main.d.cts" />

// deps

	// natives
	import { join } from "node:path"
	import { homedir } from "node:os"
	import { mkdir, rm } from "node:fs/promises"

	// externals
	import { Orchestrator } from "node-pluginsmanager-plugin";

	// locals
	import PluginManager from "../../lib/cjs/main.cjs";

// consts

	const EXTERNAL_DIRECTORY: string = join(homedir(), "MySoftware");
	const EXTERNAL_DIRECTORY_PLUGINS: string = join(EXTERNAL_DIRECTORY, "plugins");
	const EXTERNAL_DIRECTORY_RESSOURCES: string = join(EXTERNAL_DIRECTORY, "ressources");

	const manager: PluginManager = new PluginManager({
		"directory": EXTERNAL_DIRECTORY_PLUGINS,
		"externalRessourcesDirectory": EXTERNAL_DIRECTORY_RESSOURCES
	});

// module

try {

	console.log(PluginManager);
	console.log(manager);

	manager

		// error
		.on("error", (err: Error): void => {
			console.log("--- [event/error] '" + err.message + "' ---");
		})

		// load
		.on("loading", (pluginName: string): void => {
			console.log("--- [event/loading] '" + pluginName + "' loading ---");
		}).on("loaded", (plugin: Orchestrator): void => {
			console.log("--- [event/loaded] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
		}).on("allloaded", (): void => {
			console.log("--- [event/allloaded] all plugins allloaded ---");
		})

		// init
		.on("initializing", (plugin: Orchestrator): void => {
			console.log("--- [event/initializing] '" + plugin.name + "' (v" + plugin.version + ") initialized ---");
		}).on("initialized", (plugin: Orchestrator): void => {
			console.log("--- [event/initialized] '" + plugin.name + "' (v" + plugin.version + ") initialized ---");
		}).on("allinitialized", (): void => {
			console.log("--- [event/initialized] all plugins initialized ---");
		})

		// release
		.on("released", (pluginName: string): void => {
			console.log("--- [event/released] '" + pluginName + " released ---");
		}).on("allreleased", (): void => {
			console.log("--- [event/released] all plugins released ---");
		})

		// destroy
		.on("destroyed", (pluginName: string): void => {
			console.log("--- [event/destroyed] '" + pluginName + " destroyed ---");
		}).on("alldestroyed", (): void => {
			console.log("--- [event/destroyed] all plugins destroyed ---");
		})

		// write
		.on("installed", (plugin: Orchestrator): void => {
			console.log("--- [event/installed] '" + plugin.name + "' (v" + plugin.version + ") installed ---");
		}).on("updated", (plugin: Orchestrator): void => {
			console.log("--- [event/updated] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
		}).on("uninstalled", (pluginName: string): void => {
			console.log("--- [event/uninstalled] '" + pluginName + "' uninstalled ---");
		});

	manager.setOrder([ "1", "2" ]).then((): Promise<void> => {

		return manager.beforeInitAll((): Promise<void> => {
			return manager.releaseAll(); // just to check beforeInitAll
		});

	}).then((): Promise<string | undefined> => {

		return mkdir(EXTERNAL_DIRECTORY, {
			"recursive": true
		}).then((): Promise<string | undefined> => {

			return mkdir(EXTERNAL_DIRECTORY_PLUGINS, {
				"recursive": true
			});

		}).then((): Promise<string | undefined> => {

			return mkdir(EXTERNAL_DIRECTORY_RESSOURCES, {
				"recursive": true
			});

		});

	}).then((): Promise<void> => {

		return manager.initAll();

	}).then((): void => {

		console.log("all plugins initialized");
		console.log(manager.getPluginsNames());

		/*
		manager.installViaGithub(
			<account>,
			<plugin>,
			<optional data to pass to the 'install' && 'init' plugins methods>
		).then((plugin) => {
			console.log(plugin.name + ' installed & initialized');
		}).catch((err) => {
			console.log(err);
		});

		manager.updateViaGithub( // use "github"'s plugin data if exists
			<plugin>,
			<optional data to pass to the 'release', 'update', && 'init' plugins methods>
		).then((plugin) => {
			console.log(plugin.name + ' updated & initialized');
		}).catch((err) => {
			console.log(err);
		});

		manager.uninstall(
			<plugin>,
			<optional data to pass to the 'release' && 'uninstall' plugins methods>
		).then((pluginName) => {
			console.log(pluginName + ' removed');
		}).catch((err) => {
			console.log(err);
		});
		*/

	}).then((): Promise<void> => {

		return rm(EXTERNAL_DIRECTORY_RESSOURCES, {
			"recursive": true
		}).then((): Promise<void> => {

			return rm(EXTERNAL_DIRECTORY_PLUGINS, {
				"recursive": true
			});

		}).then((): Promise<void> => {

			return rm(EXTERNAL_DIRECTORY, {
				"recursive": true
			});

		});

	}).catch((err: Error): void => {

		console.error(err);

		process.exitCode = 1;
		process.exit(1);

	});

}
catch (e) {

	console.error(e);

	process.exitCode = 1;
	process.exit(1);

}