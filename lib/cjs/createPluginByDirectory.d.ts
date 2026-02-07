import type { Orchestrator, tLogger } from "node-pluginsmanager-plugin";
export default function createPluginByDirectory(directory: string, externalResourcesDirectory: string, logger: tLogger | null, ...data: unknown[]): Promise<Orchestrator>;
