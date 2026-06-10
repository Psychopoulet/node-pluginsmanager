// deps

    // natives
    import { join } from "node:path";

    // externals
    import { Orchestrator } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";

// module

export default class OrchestratorGoodPluginNotBuilded extends Orchestrator {

    constructor (options: iOrchestratorOptions) {

        const opt = options || {};

            opt.packageFile = join(__dirname, "package.json");
            opt.descriptorFile = join(__dirname, "Descriptor.json");
            opt.mediatorFile = join(__dirname, "Mediator.js");
            opt.serverFile = join(__dirname, "Server.js");

        super(opt);

    }

};
