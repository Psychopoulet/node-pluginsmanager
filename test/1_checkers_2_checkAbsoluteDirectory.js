// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const checkAbsoluteDirectory = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkAbsoluteDirectory.js"));

// tests

describe("checkers / checkAbsoluteDirectory", () => {

    it("should test with empty data", (done) => {

        checkAbsoluteDirectory.default("directory").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkAbsoluteDirectory.default("directory", 1234).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with empty data", (done) => {

        checkAbsoluteDirectory.default("directory", "").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof Error, "Generated error is not as expected");

            done();

        });

    });

    it("should test with not absolute directory", (done) => {

        checkAbsoluteDirectory.default("directory", "./").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof Error, "Generated error is not as expected");

            done();

        });

    });

    it("should test with absolute directory", () => {

        return checkAbsoluteDirectory.default("directory", __dirname);

    });

});
