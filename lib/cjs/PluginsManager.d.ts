import EventEmitter from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
import type { Server as WebSocketServer } from "ws";
import type { Server as SocketIOServer } from "socket.io";
interface iPluginManagerOptions {
    "directory"?: string;
    "externalRessourcesDirectory"?: string;
    "logger"?: tLogger | null;
}
type tBeforeAllMethodCallback = (...data: any) => Promise<void> | void;
export default class PluginsManager extends EventEmitter {
    protected _beforeLoadAll: tBeforeAllMethodCallback | null;
    protected _beforeInitAll: tBeforeAllMethodCallback | null;
    protected _logger: tLogger | null;
    protected _orderedPluginsNames: string[];
    directory: string;
    externalRessourcesDirectory: string;
    plugins: Orchestrator[];
    constructor(options: iPluginManagerOptions);
    getPluginsNames(): string[];
    setOrder(pluginsNames: string[]): Promise<void>;
    getOrder(): string[];
    checkAllModules(): Promise<void>;
    checkModules(plugin: Orchestrator): Promise<void>;
    appMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void): void;
    socketMiddleware(server: WebSocketServer | SocketIOServer): void;
    beforeLoadAll(callback: tBeforeAllMethodCallback): Promise<void>;
    loadAll(...data: any): Promise<void>;
    destroyAll(...data: any): Promise<void>;
    beforeInitAll(callback: tBeforeAllMethodCallback): Promise<void>;
    initAll(...data: any): Promise<void>;
    releaseAll(...data: any): Promise<void>;
    installViaGithub(user: string, repo: string, ...data: any): Promise<Orchestrator>;
    updateViaGithub(plugin: Orchestrator, ...data: any): Promise<Orchestrator>;
    uninstall(plugin: Orchestrator, ...data: any): Promise<string>;
}
export {};
