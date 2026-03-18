// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));

// tests

describe("pluginsmanager / beforeLoadAll", () => {

    const pluginsManager = new PluginsManager({
        "directory": join(__dirname, "plugins")
    });

    after(() => {
        return pluginsManager.destroyAll();
    });

    it("should test empty data", (done) => {

        pluginsManager.beforeLoadAll().then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test wrong data", (done) => {

        pluginsManager.beforeLoadAll(false).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should success on beforeLoadAll call without Promise", () => {

        return pluginsManager.beforeLoadAll(() => {
            // nothing to do here
        }).then(() => {
            return pluginsManager.loadAll();
        });

    });

    it("should success on beforeLoadAll call with Promise", () => {

        return pluginsManager.beforeLoadAll(() => {
            return Promise.resolve();
        }).then(() => {
            return pluginsManager.loadAll();
        });

    });

});
