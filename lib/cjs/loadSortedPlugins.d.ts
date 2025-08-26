import type { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
export default function loadSortedPlugins(globalDirectory: string, externalRessourcesDirectory: string, files: string[], loadedPlugins: Orchestrator[], orderedPluginsNames: string[], emit: (eventName: string, ...subdata: any) => void, logger: tLogger | null, ...data: any): Promise<void>;
