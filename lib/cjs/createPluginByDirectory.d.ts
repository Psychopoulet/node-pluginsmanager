import { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
export default function createPluginByDirectory(directory: string, externalRessourcesDirectory: string, logger: tLogger | null, ...data: any): Promise<Orchestrator>;
