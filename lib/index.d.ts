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
		protected _orderedDirectoriesBaseNames: Array<string>;
		protected _maxListeners: number;

		protected directory: string;
		protected plugins: Array<Orchestrator>;

		constructor (options?: PluginManagerOptions);

		protected _initOrderedPlugins(data?: any);
		protected _releaseLast(data?: any);

		public getPluginsNames(): Array<string>;
		public setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void>;

		public beforeInitAll(callback: () => Promise<any>): Promise<void>;
		public initByDirectory(directory: string, data?: any): Promise<void>;
		public initAll(data?: any): Promise<void>;

		public release(plugin: Orchestrator, data?: any): Promise<void>;
		public releaseByKey(key: number, data?: any): Promise<void>;
		public releaseAll(data?: any): Promise<void>;

		public installViaGithub(user: string, repo: string, data?: any): Promise<Orchestrator>;

		public updateViaGithub(plugin: Orchestrator, data?: any): Promise<Orchestrator>;
		public updateByKey(key: number, data?: any): Promise<Orchestrator>;

		public uninstall(plugin: Orchestrator, data?: any): Promise<string>;
		public uninstallByKey(key: number, data?: any): Promise<string>;

	}

	export = PluginManager;

}
