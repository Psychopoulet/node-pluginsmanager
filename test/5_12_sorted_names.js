// deps

    // natives
    const { ok } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const initSortedPlugins = require(join(__dirname, "..", "lib", "src", "initSortedPlugins.ts")).default;
    const loadSortedPlugins = require(join(__dirname, "..", "lib", "src", "loadSortedPlugins.ts")).default;

// private

    function _plugin (name) {

        return {
            "name": name,
            "init": () => {
                return Promise.resolve();
            }
        };

    }

// tests

describe("sorted plugin names", () => {

    it("should order equal and unordered names while initializing", () => {

        return initSortedPlugins([
            _plugin("b"),
            _plugin("a"),
            _plugin("a")
        ], [], () => {
            // nothing to do here
        }).then(() => {

            return initSortedPlugins([], [], () => {
                // nothing to do here
            });

        }).then(() => {

            return initSortedPlugins([ _plugin("a") ], [ "a" ], () => {
                // nothing to do here
            });

        });

    });

    it("should order equal names while loading", () => {

        return loadSortedPlugins([], __dirname, [], [], () => {
            // nothing to do here
        }, null).then(() => {

            return loadSortedPlugins([
                {
                    "name": "b",
                    "directory": join(__dirname, "missing-b")
                },
                {
                    "name": "a",
                    "directory": join(__dirname, "missing-a")
                },
                {
                    "name": "a",
                    "directory": join(__dirname, "missing-a-again")
                }
            ], __dirname, [], [], () => {
                // nothing to do here
            }, null).then(() => {
                throw new Error("expected the missing directories to fail");
            }).catch((err) => {
                ok(err instanceof Error, "Generated error is not an Error");
            });

        });

    });

});
