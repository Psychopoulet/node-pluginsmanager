// deps

    // locals
    import createPluginByDirectory from "./createPluginByDirectory";

// types & interfaces

    // externals
    import type { Orchestrator, tLogger } from "node-pluginsmanager-plugin";

    export interface PluginToLoad {
        "name": string;
        "directory": string;
    }

// private

    // methods

        function _loadPlugin (
            pluginToLoad: PluginToLoad,
            externalResourcesDirectory: string,
            loadedPlugins: Orchestrator[],
            emit: (eventName: string, ...subdata: unknown[]) => void,
            logger: tLogger | null,
            ...data: unknown[]
        ): Promise<void> {

            // is already loaded ?
            const plugin: Orchestrator | undefined = loadedPlugins.find((p: Orchestrator): boolean => {
                return pluginToLoad.name === p.name;
            });

            // is already exists ?
            return plugin ? Promise.resolve() : Promise.resolve().then((): Promise<Orchestrator> => {

                emit("loading", pluginToLoad.name, ...data);

                return createPluginByDirectory(pluginToLoad.directory, externalResourcesDirectory, logger, ...data);

            // emit event
            }).then((createdPlugin: Orchestrator): Promise<void> => {

                emit("loaded", createdPlugin, ...data);
                loadedPlugins.push(createdPlugin);

                return Promise.resolve();

            });

        }

        function _loadPlugins (
            pluginsToLoad: PluginToLoad[],
            externalResourcesDirectory: string,
            loadedPlugins: Orchestrator[],
            emit: (eventName: string, ...subdata: unknown[]) => void,
            logger: tLogger | null,
            i: number,
            ...data: unknown[]
        ): Promise<void> {

            return i < pluginsToLoad.length ? Promise.resolve().then((): Promise<void> => {

                return _loadPlugin(pluginsToLoad[i], externalResourcesDirectory, loadedPlugins, emit, logger, ...data);

            // loop
            }).then((): Promise<void> => {

                return _loadPlugins(pluginsToLoad, externalResourcesDirectory, loadedPlugins, emit, logger, i + 1, ...data);

            }) : Promise.resolve();

        }

// module

export default function loadSortedPlugins (
    pluginsToLoad: PluginToLoad[], externalResourcesDirectory: string,
    loadedPlugins: Orchestrator[], orderedPluginsNames: string[],
    emit: (eventName: string, ...subdata: unknown[]) => void, logger: tLogger | null, ...data: unknown[]
): Promise<void> {

    // if no plugins, does not run
    return !pluginsToLoad.length ? Promise.resolve() : Promise.resolve().then((): Promise<void> => {

        const sortedPlugins: PluginToLoad[] = [];
        orderedPluginsNames.forEach((pluginName: string): void => {

            const plugin: PluginToLoad | undefined = pluginsToLoad.find((p: PluginToLoad): boolean => {
                return p.name === pluginName;
            });

            if (plugin) {
                sortedPlugins.push(plugin);
            }

        });

        // first, sorted plugins
        return sortedPlugins.length
            ? _loadPlugins(sortedPlugins, externalResourcesDirectory, loadedPlugins, emit, logger, 0, ...data)
            : Promise.resolve();

    }).then((): Promise<void> => {

        const unsortedPlugins: PluginToLoad[] = [
            ...pluginsToLoad.filter((plugin: PluginToLoad): boolean => {
                return !orderedPluginsNames.includes(plugin.name);
            }).sort((a: PluginToLoad, b: PluginToLoad): -1 | 0 | 1 => {

                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return 0;
                }

            })
        ];

        // then, all other plugins
        return unsortedPlugins.length
            ? _loadPlugins(unsortedPlugins, externalResourcesDirectory, loadedPlugins, emit, logger, 0, ...data)
            : Promise.resolve();

    });

}
