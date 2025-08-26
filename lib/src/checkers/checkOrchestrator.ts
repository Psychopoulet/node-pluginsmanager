// deps

    // natives
    import EventEmitter from "node:events";

    // locals
    import checkFunction from "./checkFunction";

// types & interfaces

    // externals
    import type { Orchestrator } from "node-pluginsmanager-plugin";

// module

export default function checkOrchestrator (dataName: string, data: Orchestrator): Promise<void> {

    if ("undefined" === typeof data) {
        return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
    }
        else if ("object" !== typeof data || !(data instanceof EventEmitter)) {
            return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Event"));
        }

    else {

        return checkFunction("isOrchestrator/load", data.load).then((): Promise<void> => {
            return checkFunction("isOrchestrator/destroy", data.destroy);
        }).then((): Promise<void> => {
            return checkFunction("isOrchestrator/init", data.init);
        }).then((): Promise<void> => {
            return checkFunction("isOrchestrator/release", data.release);
        }).then((): Promise<void> => {
            return checkFunction("isOrchestrator/install", data.install);
        }).then((): Promise<void> => {
            return checkFunction("isOrchestrator/update", data.update);
        }).then((): Promise<void> => {
            return checkFunction("isOrchestrator/uninstall", data.uninstall);
        });

    }

}
