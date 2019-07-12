/// <reference types="node" />
/// <reference types="node-pluginsmanager-plugin" />

declare module "node-pluginsmanager" {

	import * as Events from "events";
	import { Orchestrator } from "node-pluginsmanager-plugin";

	class PluginManagerOptions extends Object {
		directory: string
	}

	class PluginManager extends Events {

		protected _beforeInitAll: Function | null;
		protected _orderedPluginsNames: Array<string>;
		protected _maxListeners: number;

		protected directory: string;
		protected plugins: Array<Orchestrator>;

		constructor (options?: PluginManagerOptions);

		protected _initOrderedPlugins(data?: any): Promise<void>;
		protected _initByDirectory(directory: string, data?: any): Promise<Orchestrator>;
		protected _releaseLast(data?: any): Promise<void>;
		protected _destroyLast(data?: any): Promise<void>;

		public getPluginsNames(): Array<string>;
		public setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void>;

		public beforeInitAll(callback: () => Promise<any>): Promise<void>;
		public initAll(data?: any): Promise<void>;

		public releaseAll(data?: any): Promise<void>;
		public destroyAll(data?: any): Promise<void>;

		public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>;
		public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>;
		public uninstall(plugin: Orchestrator, data?: any): Promise<string>;

	}

	export = PluginManager;

}
