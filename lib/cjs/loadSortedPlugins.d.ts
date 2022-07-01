import { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
export default function loadSortedPlugins(globalDirectory: string, externalRessourcesDirectory: string, files: Array<string>, loadedPlugins: Array<Orchestrator>, orderedPluginsNames: Array<string>, emit: (eventName: string, ...subdata: any) => void, logger: tLogger | null, ...data: any): Promise<void>;
