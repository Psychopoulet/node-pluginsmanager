// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // externals
    const { Orchestrator } = require("node-pluginsmanager-plugin");

    // locals
    const checkOrchestrator = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkOrchestrator.js"));

// tests

describe("checkers / checkOrchestrator", () => {

    it("should test with empty data", (done) => {

        checkOrchestrator.default("orchestrator").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkOrchestrator.default("orchestrator", 1234).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong object", (done) => {

        checkOrchestrator.default("orchestrator", {}).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with Orchestrator", () => {

        return checkOrchestrator.default("orchestrator", new Orchestrator({
            "externalResourcesDirectory": "",
            "packageFile": "",
            "descriptorFile": "",
            "mediatorFile": "",
            "serverFile": ""
        }));

    });

});
