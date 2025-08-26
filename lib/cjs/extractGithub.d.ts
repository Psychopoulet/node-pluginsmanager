import type { Orchestrator } from "node-pluginsmanager-plugin";
interface OrchestratorExtended extends Orchestrator {
    "github"?: string;
    "repository"?: string | Record<string, string>;
}
export default function extractGithub(plugin: OrchestratorExtended): string;
export {};
