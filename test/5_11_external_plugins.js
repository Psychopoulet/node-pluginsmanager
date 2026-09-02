// deps

    // natives
    const { cp, mkdir, rm } = require("node:fs/promises");
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));
    const isDirectory = require(join(__dirname, "..", "lib", "cjs", "utils", "isDirectory.js")).default;

// const

    const PLUGINS_DIRECTORY = join(__dirname, "plugins");
    const LOCAL_DIRECTORY = join(__dirname, "plugins-local");
    const EXTERNAL_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "test-good-plugin-with-default-export");
    const EXTERNAL_PLUGIN_NAME = "test-good-plugin-with-default-export";
    const LOCAL_PLUGIN_NAME = "test-good-plugin-without-dependencies";
    const LOCAL_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, LOCAL_PLUGIN_NAME);

    const EVENTS_DATA = "test";

// private

    function _createLocalDirectory () {

        return rm(LOCAL_DIRECTORY, {
            "recursive": true,
            "force": true
        }).then(() => {

            return mkdir(LOCAL_DIRECTORY, {
                "recursive": true
            });

        });

    }

    function _copyLocalPlugin () {

        return cp(
            LOCAL_PLUGIN_DIRECTORY,
            join(LOCAL_DIRECTORY, LOCAL_PLUGIN_NAME),
            { "recursive": true }
        );

    }

    function _copyConflictingLocalPlugin () {

        return cp(
            EXTERNAL_PLUGIN_DIRECTORY,
            join(LOCAL_DIRECTORY, EXTERNAL_PLUGIN_NAME),
            { "recursive": true }
        );

    }

    function _createPluginsManager () {

        return new PluginsManager({
            "directory": LOCAL_DIRECTORY
        });

    }

// tests

describe("pluginsmanager / external plugins", () => {

    describe("addExternalPluginDirectory", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory();

        });

        it("should test without directory", (done) => {

            pluginsManager.addExternalPluginDirectory().then(() => {
                done(new Error("Does not generate Error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof ReferenceError, "Generated error is not as expected");

                done();

            });

        });

        it("should test with wrong directory", (done) => {

            pluginsManager.addExternalPluginDirectory(false).then(() => {
                done(new Error("Does not generate Error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof TypeError, "Generated error is not as expected");

                done();

            });

        });

        it("should test with empty directory", (done) => {

            pluginsManager.addExternalPluginDirectory("").then(() => {
                done(new Error("Does not generate Error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof RangeError, "Generated error is not as expected");

                done();

            });

        });

        it("should test with relative directory", (done) => {

            pluginsManager.addExternalPluginDirectory("./").then(() => {
                done(new Error("Does not generate Error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");

                done();

            });

        });

        it("should test with duplicate directory", () => {

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY).then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("already registered as external plugin directory"), "Generated error message is not as expected");

            });

        });

        it("should test with duplicate plugin name", () => {

            const duplicateDirectory = join(__dirname, "plugins-external-duplicate", EXTERNAL_PLUGIN_NAME);

            return rm(join(__dirname, "plugins-external-duplicate"), {
                "recursive": true,
                "force": true
            }).then(() => {
                return cp(EXTERNAL_PLUGIN_DIRECTORY, duplicateDirectory, {
                    "recursive": true
                });
            }).then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.addExternalPluginDirectory(duplicateDirectory);
            }).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("already registered"), "Generated error message is not as expected");

            });

        });

        it("should reject external plugin with same name as local plugin", () => {

            return _copyLocalPlugin().then(() => {
                return pluginsManager.addExternalPluginDirectory(LOCAL_PLUGIN_DIRECTORY);
            }).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("already exists as a local plugin"), "Generated error message is not as expected");

            });

        });

        it("should register external plugin directory", () => {

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);

        });

    });

    describe("loadAll", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory();

        });

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.destroyAll();

        });

        it("should load external plugin", () => {

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY).then(() => {
                return pluginsManager.loadAll();
            }).then(() => {

                strictEqual(pluginsManager.plugins.length, 1, "plugins length is not valid");
                strictEqual(pluginsManager.getPluginsNames()[0], EXTERNAL_PLUGIN_NAME, "external plugin is not loaded");

            });

        });

        it("should test load events", () => {

            const loadedPluginNames = [];

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY).then(() => {

                return new Promise((resolve, reject) => {

                    pluginsManager.on("loading", (pluginName, data) => {

                        strictEqual(pluginName, EXTERNAL_PLUGIN_NAME, "Events pluginName is not as expected");
                        strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                    }).on("loaded", (plugin, data) => {

                        loadedPluginNames.push(plugin.name);

                        strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                    }).on("allloaded", (data) => {

                        try {

                            strictEqual(data, EVENTS_DATA, "Events data is not as expected");
                            strictEqual(loadedPluginNames.length, 1, "loaded plugins count is not valid");
                            strictEqual(loadedPluginNames[0], EXTERNAL_PLUGIN_NAME, "loaded plugin name is not valid");

                            resolve();

                        }
                        catch (e) {
                            reject(e);
                        }

                    });

                    pluginsManager.loadAll(EVENTS_DATA).catch(reject);

                });

            });

        });

        it("should load local and external plugins", () => {

            return _copyLocalPlugin().then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.loadAll();
            }).then(() => {

                strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");
                ok(pluginsManager.getPluginsNames().includes(EXTERNAL_PLUGIN_NAME), "external plugin is not loaded");
                ok(pluginsManager.getPluginsNames().includes(LOCAL_PLUGIN_NAME), "local plugin is not loaded");

            });

        });

        it("should load plugins according to order", () => {

            const loadedPluginNames = [];

            return _copyLocalPlugin().then(() => {
                return pluginsManager.setOrder([ EXTERNAL_PLUGIN_NAME, LOCAL_PLUGIN_NAME ]);
            }).then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {

                return new Promise((resolve, reject) => {

                    pluginsManager.on("loaded", (plugin) => {
                        loadedPluginNames.push(plugin.name);
                    }).on("allloaded", () => {

                        try {

                            strictEqual(loadedPluginNames[0], EXTERNAL_PLUGIN_NAME, "first loaded plugin is not as expected");
                            strictEqual(loadedPluginNames[1], LOCAL_PLUGIN_NAME, "second loaded plugin is not as expected");

                            resolve();

                        }
                        catch (e) {
                            reject(e);
                        }

                    });

                    pluginsManager.loadAll().catch(reject);

                });

            });

        });

        it("should reject name conflict between local and external plugins", () => {

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY).then(() => {
                return _copyConflictingLocalPlugin();
            }).then(() => {
                return pluginsManager.loadAll();
            }).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("name conflict between local and external plugins"), "Generated error message is not as expected");

            });

        });

    });

    describe("initAll", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory().then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.loadAll();
            });

        });

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.destroyAll();

        });

        it("should initialize external plugin", () => {

            return pluginsManager.initAll().then(() => {

                const plugin = pluginsManager.plugins.find((p) => {
                    return p.name === EXTERNAL_PLUGIN_NAME;
                });

                ok(plugin, "external plugin is not loaded");
                ok(plugin.initialized, "external plugin is not initialized");

            });

        });

    });

    describe("updateViaGithub", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory().then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.loadAll();
            });

        });

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.destroyAll();

        });

        it("should reject external plugin update", () => {

            const plugin = pluginsManager.plugins.find((p) => {
                return p.name === EXTERNAL_PLUGIN_NAME;
            });

            return pluginsManager.updateViaGithub(plugin).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("cannot be updated"), "Generated error message is not as expected");

            });

        });

    });

    describe("uninstall", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory().then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.loadAll();
            });

        });

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.destroyAll();

        });

        it("should reject external plugin uninstall", () => {

            const plugin = pluginsManager.plugins.find((p) => {
                return p.name === EXTERNAL_PLUGIN_NAME;
            });

            return pluginsManager.uninstall(plugin).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("cannot be uninstalled"), "Generated error message is not as expected");

                return isDirectory(EXTERNAL_PLUGIN_DIRECTORY);

            }).then((exists) => {

                ok(exists, "external plugin directory was removed");

            });

        });

    });

    describe("installViaGithub", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory();

        });

        it("should reject install with same name as external plugin", () => {

            return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY).then(() => {
                return pluginsManager.installViaGithub("Psychopoulet", EXTERNAL_PLUGIN_NAME);
            }).then(() => {
                throw new Error("Does not generate Error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");
                ok(err.message.includes("already registered as external"), "Generated error message is not as expected");

            });

        });

    });

    describe("releaseAll && destroyAll", () => {

        let pluginsManager = null;

        beforeEach(() => {

            pluginsManager = _createPluginsManager();

            return _createLocalDirectory().then(() => {
                return _copyLocalPlugin();
            }).then(() => {
                return pluginsManager.addExternalPluginDirectory(EXTERNAL_PLUGIN_DIRECTORY);
            }).then(() => {
                return pluginsManager.loadAll();
            }).then(() => {
                return pluginsManager.initAll();
            });

        });

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.destroyAll();

        });

        it("should release local and external plugins", () => {

            return pluginsManager.releaseAll().then(() => {

                strictEqual(pluginsManager.plugins.length, 2, "plugins length is not valid");

                pluginsManager.plugins.forEach((plugin) => {
                    strictEqual(plugin.initialized, false, "plugin \"" + plugin.name + "\" is not released");
                });

            });

        });

        it("should destroy local and external plugins", () => {

            return pluginsManager.destroyAll().then(() => {

                strictEqual(pluginsManager.plugins.length, 0, "plugins length is not valid");

            });

        });

    });

});
