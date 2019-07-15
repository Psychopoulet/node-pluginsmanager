/// <reference types="node" />
/// <reference types="node-pluginsmanager-plugin" />

declare module "node-pluginsmanager" {

	import * as Events from "events";
	import { Orchestrator } from "node-pluginsmanager-plugin";

	class PluginManagerOptions extends Object {
		directory: string
	}

	class PluginManager extends Events {

		// attributes

			// protected

				protected _beforeInitAll: Function | null;
				protected _orderedPluginsNames: Array<string>;

			// public

				public directory: string;
				public plugins: Array<Orchestrator>;

		// constructor

			constructor (options?: PluginManagerOptions);

		// methods

			// protected

				protected _checkPluginsModules(): Promise<void>;
				protected _initOrderedPlugins(data?: any): Promise<void>;
				protected _initByDirectory(directory: string, data?: any): Promise<Orchestrator>;
				protected _releaseLast(data?: any): Promise<void>;
				protected _destroyLast(data?: any): Promise<void>;

			// public

				// getters

				public getPluginsNames(): Array<string>;

				// setters

				public setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void>;

				// checkers

				public checkAllModules(): Promise<void>;
				public checkModules(plugin: Orchestrator): Promise<void>;

				// network

				public appMiddleware(req: Request, res: Response, next: Function): void;
				public httpMiddleware(req: Request, res: Response): boolean;

				// init

				public beforeInitAll(callback: () => Promise<any>): Promise<void>;
				public initAll(data?: any): Promise<void>;

				// release

				public releaseAll(data?: any): Promise<void>;
				public destroyAll(data?: any): Promise<void>;

				// write

				public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>;
				public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>;
				public uninstall(plugin: Orchestrator, data?: any): Promise<string>;

	}

	export = PluginManager;

}
