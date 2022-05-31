/// <reference types="node" />

declare module "node-pluginsmanager" {

	import { EventEmitter } from "events";
	import { Orchestrator } from "node-pluginsmanager-plugin";
	import { Server as WebSocketServer } from "ws";
	import { Server as SocketIOServer } from "socket.io";

	interface iPluginManagerOptions {
		"directory"?: string; // plugins location. default : join(homedir(), "node-pluginsmanager-plugins")
		"externalRessourcesDirectory"?: string; // external resources locations (sqlite, files, cache, etc...). default : join(homedir(), "node-pluginsmanager-resources")
		"logger"?: Function | null;
	}

	class PluginManager extends EventEmitter {

		// attributes

			// protected

				protected _beforeLoadAll: (data?: any) => Promise<void> | void | null;
				protected _beforeInitAll: (data?: any) => Promise<void> | void | null;

				protected _orderedPluginsNames: Array<string>;

			// public

				public directory: string;
				public externalRessourcesDirectory: string;
				public plugins: Array<Orchestrator>;

		// constructor

			constructor (options?: iPluginManagerOptions);

		// methods

			// public

				// getters

				public getPluginsNames(): Array<string>;

				// setters

				public setOrder(pluginsNames: Array<string>): Promise<void>;

				// checkers

				public checkAllModules(): Promise<void>;
				public checkModules(plugin: Orchestrator): Promise<void>;

				// network

				public appMiddleware(req: Request, res: Response, next: Function): void;
				public socketMiddleware(server: WebSocketServer | SocketIOServer): void;

				// load / destroy

				public beforeLoadAll(callback: (data?: any) => Promise<void> | void): Promise<void>;
				public loadAll(data?: any): Promise<void>;
				public destroyAll(data?: any): Promise<void>;

				// init / release

				public beforeInitAll(callback: (data?: any) => Promise<void> | void): Promise<void>;
				public initAll(data?: any): Promise<void>;
				public releaseAll(data?: any): Promise<void>;

				// write

				public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>;
				public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>;
				public uninstall(plugin: Orchestrator, data?: any): Promise<string>;

	}

	export = PluginManager;

}
