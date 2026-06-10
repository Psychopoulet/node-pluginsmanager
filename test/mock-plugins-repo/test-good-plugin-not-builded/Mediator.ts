// deps

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// module

export default class MediatorGoodPluginNotBuilded extends Mediator {

    _initWorkSpace (): Promise<void> {

        return Promise.resolve();

    }

    _releaseWorkSpace (): Promise<void> {

        return Promise.resolve();

    }

    create (): Promise<void> {

        return Promise.resolve();

    }

};
