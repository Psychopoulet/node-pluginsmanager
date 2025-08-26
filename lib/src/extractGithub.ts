// types & interfaces

    // externals
    import type { Orchestrator } from "node-pluginsmanager-plugin";

    // locals

    interface OrchestratorExtended extends Orchestrator {
        "github"?: string;
        "repository"?: string | Record<string, string>;
    }

// module

export default function extractGithub (plugin: OrchestratorExtended): string {

    let github: string = "";

    if ("object" === typeof plugin) {

        if ("string" === typeof plugin.github) {
            github = plugin.github;
        }
        else if ("string" === typeof plugin.repository) {
            github = plugin.repository;
        }
        else if ("object" === typeof plugin.repository && "string" === typeof plugin.repository.url) {
            github = plugin.repository.url;
        }

    }

    return github;

}
