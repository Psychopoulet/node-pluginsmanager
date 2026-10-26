// deps

    // natives
    const { deepStrictEqual, strictEqual, throws } = require("node:assert");
    const { homedir } = require("node:os");
    const { join } = require("node:path");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "src", "main.cts"));

// tests

describe("pluginsmanager / constructor", () => {

    it("should test empty params", () => {

        const pluginsManager = new PluginsManager();

        // private
        strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
        deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");

        // public
        strictEqual(pluginsManager.directory, join(homedir(), "node-pluginsmanager-plugins"), "Generated plugin is not as expected");
        deepStrictEqual(pluginsManager.plugins, [], "Generated plugin is not as expected");

    });

    it("should test given directory", () => {

        const pluginsManager = new PluginsManager({
            "directory": join(__dirname, "plugins2")
        });

        // private
        strictEqual(pluginsManager._beforeInitAll, null, "Generated plugin is not as expected");
        deepStrictEqual(pluginsManager._orderedPluginsNames, [], "Generated plugin is not as expected");

        // public
        strictEqual(pluginsManager.directory, join(__dirname, "plugins2"), "Generated plugin is not as expected");

    });

    it("should reject options that are not an object", () => {

        throws(() => {
            return new PluginsManager(false);
        }, (err) => {
            return err instanceof ReferenceError;
        });

    });

    it("should call next when no plugin exposes app middleware", () => {

        const pluginsManager = new PluginsManager({
            "directory": join(__dirname, "plugins")
        });
        let called = false;

        pluginsManager.appMiddleware({}, {}, () => {
            called = true;
        });

        strictEqual(called, true, "next was not called");

    });

});
