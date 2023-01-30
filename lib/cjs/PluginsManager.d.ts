/// <reference types="node" />
import EventEmitter from "events";
import { Orchestrator, tLogger, iIncomingMessage, iServerResponse } from "node-pluginsmanager-plugin";
import { Server as WebSocketServer } from "ws";
import { Server as SocketIOServer } from "socket.io";
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
    protected _orderedPluginsNames: Array<string>;
    directory: string;
    externalRessourcesDirectory: string;
    plugins: Array<Orchestrator>;
    constructor(options: iPluginManagerOptions);
    getPluginsNames(): Array<string>;
    setOrder(pluginsNames: Array<string>): Promise<void>;
    getOrder(): Array<string>;
    checkAllModules(): Promise<void>;
    checkModules(plugin: Orchestrator): Promise<void>;
    appMiddleware(req: iIncomingMessage, res: iServerResponse, next: Function): void;
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
