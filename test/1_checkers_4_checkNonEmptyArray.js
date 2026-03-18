// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const checkNonEmptyArray = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkNonEmptyArray.js"));

// tests

describe("checkers / checkNonEmptyArray", () => {

    it("should test with empty data", (done) => {

        checkNonEmptyArray.default("array").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkNonEmptyArray.default("array", 1234).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkNonEmptyArray.default("array", {}).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with empty data", (done) => {

        checkNonEmptyArray.default("array", []).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof RangeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with absolute array", () => {

        return checkNonEmptyArray.default("array", [ "test" ]);

    });

});
