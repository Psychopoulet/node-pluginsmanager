// deps

    // externals
    import { Server } from "node-pluginsmanager-plugin";

// types & interfaces

    // natives
    import type { IncomingMessage, ServerResponse } from "node:http";

// module

export default class ServerGoodPluginNotBuilded extends Server {

    appMiddleware (req: IncomingMessage, res: ServerResponse, next: () => void): void {

        console.log("ServerGoodPluginNotBuilded", "appMiddleware");

        super.appMiddleware(req, res, next);

    }

};
