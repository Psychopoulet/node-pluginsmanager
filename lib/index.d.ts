/// <reference types="node" />
/// <reference types="node-pluginsmanager-plugin" />

declare module "node-pluginsmanager" {

	import * as Events from "events";
	import { Orchestrator as Plugin } from "node-pluginsmanager-plugin";

	class PluginManagerOptions extends Object {
		directory: string
	}

	class PluginManager extends Events {

		protected _beforeInitAll: Function | null;
		protected _orderedDirectoriesBaseNames: Array<string>;
		protected _maxListeners: number;

		protected directory: string;
		protected plugins: Array<Plugin>;

		constructor (options?: PluginManagerOptions);

		protected _directoryToKey(directory: string);
		protected _initOrderedPlugins(data?: any, i?: number);
		protected _releaseNext(data?: any);

		public static plugin(): Plugin;
		public getPluginsNames(): Array<string>;
		public setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void>;

		public beforeInitAll(callback: () => Promise<any>): Promise<void>;
		public initByDirectory(directory: string, data?: any): Promise<void>;
		public initAll(data?: any): Promise<Plugin>;

		public release(plugin: Plugin, data?: any): Promise<void>;
		public releaseByDirectory(directory: string, data?: any): Promise<void>;
		public releaseByKey(directory: string, data?: any): Promise<void>;
		public releaseAll(data?: any): Promise<void>;

		public installViaGithub(user: string, repo: string, data?: any): Promise<void>;

		public update(plugin: Plugin, data?: any): Promise<void>;
		public updateByDirectory(directory: string, data?: any): Promise<void>;
		public updateByKey(url: string, data?: any): Promise<void>;

		public uninstall(plugin: Plugin, data?: any): Promise<string>;
		public uninstallByDirectory(directory: string, data?: any): Promise<string>;
		public uninstallByKey(url: string, data?: any): Promise<string>;

	}

	export = PluginManager;

}
