/// <reference types="node" />

declare module "node-pluginsmanager" {

	import { EventEmitter } from "events";
	import { Orchestrator } from "node-pluginsmanager-plugin";
	import { Server as WebSocketServer } from "ws";
	import { Server as SocketIOServer } from "socket.io";

	interface iPluginManagerOptions {
		"directory"?: string;
		"externalRessourcesDirectory"?: string;
		"logger"?: Function | null;
	}

	class PluginManager extends EventEmitter {

		// attributes

			// protected

				protected _beforeLoadAll: (data?: any) => Promise<void> | void | null;
				protected _beforeInitAll: (data?: any) => Promise<void> | void | null;

				protected _orderedPluginsNames: Array<string>;

			// public

				public directory: string; // plugins location (must be writable). default : join(homedir(), "node-pluginsmanager-plugins")
				public externalRessourcesDirectory: string; // external resources locations (sqlite, files, cache, etc...) (must be writable). default : join(homedir(), "node-pluginsmanager-resources")
				public plugins: Array<Orchestrator>; // plugins' Orchestrators

		// constructor

			constructor (options?: iPluginManagerOptions);

		// methods

			// public

				// getters

				public getPluginsNames(): Array<string>;

				// setters

				public setOrder(pluginsNames: Array<string>): Promise<void>; // create a forced order to synchronously initialize plugins. not ordered plugins are asynchronously initialized after.

				// checkers

				public checkAllModules(): Promise<void>;
				public checkModules(plugin: Orchestrator): Promise<void>;

				// network

				public appMiddleware(req: Request, res: Response, next: Function): void; // used for execute all plugins' middlewares in app (express or other)
				public socketMiddleware(server: WebSocketServer | SocketIOServer): void; // middleware for socket to add bilateral push events

				// load / destroy

				public beforeLoadAll(callback: (data?: any) => Promise<void> | void): Promise<void>; // add a function executed before loading all plugins
				public loadAll(data?: any): Promise<void>; // load all plugins asynchronously, using "data" in arguments for "load" plugin's Orchestrator method
				public destroyAll(data?: any): Promise<void>; // after releasing, destroy packages data & free "plugins" list, using "data" in arguments for "destroy" plugin's Orchestrator method

				// init / release

				public beforeInitAll(callback: (data?: any) => Promise<void> | void): Promise<void>; // add a function executed before initializing all plugins
				public initAll(data?: any): Promise<void>; // initialize all plugins asynchronously, using "data" in arguments for "init" plugin's Orchestrator method
				public releaseAll(data?: any): Promise<void>; // release a plugin (keep package but destroy Mediator & Server), using "data" in arguments for "release" plugin's Orchestrator method

				// write

				public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>; // install a plugin via github repo, using "data" in arguments for "install" and "init" plugin's Orchestrator methods
				public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>; // update a plugin via its github repo, using "data" in arguments for "release", "update" and "init" plugin's methods
				public uninstall(plugin: Orchestrator, data?: any): Promise<string>; // uninstall a plugin, using "data" in arguments for "release" and "uninstall" plugin's methods

	}

	export = PluginManager;

}
