import type { Orchestrator } from "node-pluginsmanager-plugin";
export default function initSortedPlugins(plugins: Orchestrator[], orderedPluginsNames: string[], emit: (eventName: string, ...subdata: any) => void, ...data: any): Promise<void>;
