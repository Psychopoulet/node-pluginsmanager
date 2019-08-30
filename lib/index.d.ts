/// <reference types="node" />
/// <reference types="node-pluginsmanager-plugin" />

declare module "node-pluginsmanager" {

	import * as Events from "events";
	import { Orchestrator } from "node-pluginsmanager-plugin";
	import { Server as WebSocketServer } from "ws";

	interface iPluginManagerOptions {
		"directory": string; // plugins location. default : join(homedir(), "node-pluginsmanager-plugins")
		"externalRessourcesDirectory": string; // external resources locations (sqlite, files, cache, etc...). default : join(homedir(), "node-pluginsmanager-resources")
	}

	class PluginManager extends Events {

		// attributes

			// protected

				protected _beforeLoadAll: Function | null;
				protected _beforeInitAll: Function | null;

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
				public socketMiddleware(server: WebSocketServer): void;

				// load / destroy

				public beforeLoadAll(callback: () => Promise<any>): Promise<void>;
				public loadAll(data?: any): Promise<void>;
				public destroyAll(data?: any): Promise<void>;

				// init / release

				public beforeInitAll(callback: () => Promise<any>): Promise<void>;
				public initAll(data?: any): Promise<void>;
				public releaseAll(data?: any): Promise<void>;

				// write

				public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>;
				public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>;
				public uninstall(plugin: Orchestrator, data?: any): Promise<string>;

	}

	export = PluginManager;

}
