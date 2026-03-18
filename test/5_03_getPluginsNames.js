// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / getPluginsNames", () => {

    const pluginsManager = new PluginsManager({
        "directory": join(__dirname, "plugins")
    });

    afterEach(() => {

        return pluginsManager.destroyAll();

    });

    it("should check plugins names before loading", () => {

        strictEqual(typeof pluginsManager.plugins, "object", "loaded plugins is not an object");
        ok(pluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
        strictEqual(pluginsManager.plugins.length, 0, "loaded plugins are incorrects");

        const pluginsNames = pluginsManager.getPluginsNames();

        strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
        ok(pluginsNames instanceof Array, "plugins names is not an Array");
        strictEqual(pluginsNames.length, 0, "plugins names length is incorrect");

    });

    it("should test normal loading", () => {

        return pluginsManager.loadAll().then(() => {

            strictEqual(typeof pluginsManager.plugins, "object", "loaded plugins is not an object");
            ok(pluginsManager.plugins instanceof Array, "loaded plugins are incorrects");
            strictEqual(pluginsManager.plugins.length, 3, "loaded plugins are incorrects");

            const pluginsNames = pluginsManager.getPluginsNames();

            strictEqual(typeof pluginsNames, "object", "plugins names is not an object");
            ok(pluginsNames instanceof Array, "plugins names is not an Array");
            strictEqual(pluginsNames.length, 3, "plugins names length is incorrect");

        });

    });

});
