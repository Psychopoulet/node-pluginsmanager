import type { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
export default function loadSortedPlugins(globalDirectory: string, externalResourcesDirectory: string, files: string[], loadedPlugins: Orchestrator[], orderedPluginsNames: string[], emit: (eventName: string, ...subdata: unknown[]) => void, logger: tLogger | null, ...data: unknown[]): Promise<void>;
