// deps

    // natives
    const { strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const checkAbsoluteDirectory = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkAbsoluteDirectory.js"));
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / externalResourcesDirectory", () => {

    const pluginsManager = new PluginsManager({
        "directory": join(__dirname, "plugins")
    });

    it("should load all", () => {

        return pluginsManager.loadAll().then(() => {

            return checkAbsoluteDirectory.default("externalResourcesDirectory", pluginsManager.externalResourcesDirectory);

        }).then(() => {

            pluginsManager.plugins.forEach((plugin) => {

                strictEqual(
                    join(pluginsManager.externalResourcesDirectory, plugin.name), plugin._externalResourcesDirectory,
                    "plugin's externalResourcesDirectory is not valid"
                );

            });

        }).then(() => {

            return pluginsManager.destroyAll();

        }).then(() => {

            pluginsManager.plugins.forEach((plugin) => {

                strictEqual(
                    plugin._externalResourcesDirectory, "",
                    "plugin's externalResourcesDirectory is not valid"
                );

            });

        });

    });

});
