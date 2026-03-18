// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const checkNonEmptyString = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkNonEmptyString.js"));

// tests

describe("checkers / checkNonEmptyString", () => {

    it("should test with empty data", (done) => {

        checkNonEmptyString.default("string").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkNonEmptyString.default("string", 1234).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with empty data", (done) => {

        checkNonEmptyString.default("string", "").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof RangeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with absolute string", () => {

        return checkNonEmptyString.default("string", "test");

    });

});
