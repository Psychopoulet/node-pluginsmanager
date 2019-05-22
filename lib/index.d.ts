/// <reference types="node" />

import Plugin = require("node-pluginsmanager-plugin");

declare module "node-pluginsmanager" {

	class PluginManager extends require("asynchronous-eventemitter") {

		protected _beforeLoadAll: null|Function;
		protected _orderedDirectoriesBaseNames: Array<string>;
		protected _maxListeners: number;

		protected directory: string;
		protected plugins: Array<Plugin>;

		constructor (directory?: string);

		protected _directoryToKey(directory: string);
		protected _error(fnName: string, err: Error);
		protected _loadOrderedNext(i: number, data?: any);
		protected _unloadNext(data?: any);

		public static plugin(): Plugin;
		public getPluginsNames(): Array<string>;
		public setOrder(pluginsDirectoriesBaseNames: Array<string>): Promise<void>;

		public beforeLoadAll(callback: () => Promise<any>): Promise<void>;
		public loadByDirectory(directory: string, data?: any): Promise<void>;
		public loadAll(data?: any): Promise<Plugin>;

		public unload(plugin: Plugin, data?: any): Promise<void>;
		public unloadByDirectory(directory: string, data?: any): Promise<void>;
		public unloadByKey(directory: string, data?: any): Promise<void>;
		public unloadAll(data?: any): Promise<void>;

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
