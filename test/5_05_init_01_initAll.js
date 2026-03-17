// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// const

    const PLUGINS_DIRECTORY = join(__dirname, "plugins");
    const EVENTS_DATA = "test";

// tests

describe("pluginsmanager / initAll", () => {

    describe("directories", () => {

        describe("directory", () => {

            it("should test without directory", (done) => {

                const pluginsManager = new PluginsManager();

                    delete pluginsManager.directory;

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof ReferenceError, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with wrong directory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": false
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof TypeError, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with empty directory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": ""
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof Error, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with inexistant directory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": "qsdfgvqzgfvqzergzqerg"
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof Error, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with relative directory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": "."
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof Error, "Generated error is not as expected");

                    done();

                });

            });

        });

        describe("externalResourcesDirectory", () => {

            it("should test without externalResourcesDirectory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": PLUGINS_DIRECTORY
                });

                    delete pluginsManager.externalResourcesDirectory;

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof ReferenceError, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with wrong externalResourcesDirectory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": PLUGINS_DIRECTORY,
                    "externalResourcesDirectory": false
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof TypeError, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with empty externalResourcesDirectory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": PLUGINS_DIRECTORY,
                    "externalResourcesDirectory": ""
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof Error, "Generated error is not as expected");

                    done();

                });

            });

            it("should test with relative externalResourcesDirectory", (done) => {

                const pluginsManager = new PluginsManager({
                    "directory": PLUGINS_DIRECTORY,
                    "externalResourcesDirectory": "."
                });

                pluginsManager.initAll().then(() => {
                    done(new Error("Does not generate Error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    ok(err instanceof Error, "Generated error is not as expected");

                    done();

                });

            });

        });

    });

    describe("execute", () => {

        const pluginsManager = new PluginsManager({
            "directory": PLUGINS_DIRECTORY
        });

        before(() => {
            return pluginsManager.loadAll();
        });

        beforeEach(() => {
            pluginsManager.directory = PLUGINS_DIRECTORY;
        });

        afterEach(() => {
            return pluginsManager.releaseAll();
        });

        after(() => {
            return pluginsManager.destroyAll();
        });

        it("should init all", () => {

            pluginsManager.plugins.forEach((plugin, key) => {
                ok(plugin.enabled, "plugin \"" + key + "\" is not valid");
                strictEqual(plugin.initialized, false, "plugin \"" + key + "\" is not valid");
            });

            return pluginsManager.initAll("test").then(() => {

                strictEqual(typeof pluginsManager.plugins, "object", "plugins is not an object");
                ok(pluginsManager.plugins instanceof Array, "plugins is not an Array");
                strictEqual(pluginsManager.plugins.length, 3, "plugins length is not valid");

                pluginsManager.plugins.forEach((plugin, key) => {
                    ok(plugin.enabled, "plugin \"" + key + "\" is not valid");
                    ok(plugin.initialized, "plugin \"" + key + "\" is not valid");
                });

            });

        });

        it("should test events", () => {

            return new Promise((resolve, reject) => {

                pluginsManager.on("initializing", (plugin, data) => {

                    strictEqual(typeof plugin, "object", "Events plugin is not an object");

                    strictEqual(typeof data, "string", "Events data is not a string");
                    strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                    (0, console).log("--- [PluginsManager/events/initializing] " + plugin.name + " - " + data);

                }).on("initialized", (plugin, data) => {

                    strictEqual(typeof plugin, "object", "Events plugin is not an object");

                    strictEqual(typeof data, "string", "Events data is not a string");
                    strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                    (0, console).log("--- [PluginsManager/events/initialized] " + plugin.name + " - " + data);

                }).on("allinitialized", (data) => {

                    try {

                        strictEqual(typeof data, "string", "Events data is not a string");
                        strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                        resolve();

                    }
                    catch (e) {
                        reject(e);
                    }

                });

                pluginsManager.initAll(EVENTS_DATA).catch(reject);

            });

        });

    });

});
