// deps

    // natives
    const { join } = require("node:path");
    const { strictEqual } = require("node:assert");
    const { mkdir } = require("node:fs/promises");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));
    const checkAbsoluteDirectory = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkAbsoluteDirectory.js"));

// tests

describe("pluginsmanager / externalResourcesDirectory", () => {

    const pluginsManager = new PluginsManager({
        "directory": join(__dirname, "plugins")
    });

    it("should load all", () => {

        let directoryTested = "";

        return pluginsManager.loadAll().then(() => {

            return checkAbsoluteDirectory.default("externalResourcesDirectory", pluginsManager.externalResourcesDirectory);

        }).then(() => {

            pluginsManager.plugins.forEach((plugin) => {

                strictEqual(
                    join(pluginsManager.externalResourcesDirectory, plugin.name), plugin._externalResourcesDirectory,
                    "plugin's externalResourcesDirectory is not valid"
                );

            });

            directoryTested = pluginsManager.plugins[0]._externalResourcesDirectory;

        }).then(() => {

            return mkdir(directoryTested);

        }).then(() => {

            return checkAbsoluteDirectory.default("directoryTested", directoryTested);

        }).then(() => {

            return pluginsManager.destroyAll();

        }).then(() => {

            return new Promise((resolve, reject) => {

                checkAbsoluteDirectory.default("directoryTested", directoryTested).then(() => {
                    reject(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not as expected");
                    strictEqual(err instanceof Error, true, "Generated error is not as expected");

                    resolve();

                });

            });

        });

    });

});
