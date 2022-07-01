import { Orchestrator } from "node-pluginsmanager-plugin";
export default function initSortedPlugins(plugins: Array<Orchestrator>, orderedPluginsNames: Array<string>, emit: (eventName: string, ...subdata: any) => void, ...data: any): Promise<void>;
