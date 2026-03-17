// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const checkDirectory = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkDirectory.js"));

// tests

describe("checkers / checkDirectory", () => {

    it("should test with empty data", (done) => {

        checkDirectory.default("directory").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof ReferenceError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with wrong data", (done) => {

        checkDirectory.default("directory", 1234).then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof TypeError, "Generated error is not as expected");

            done();

        });

    });

    it("should test with empty data", (done) => {

        checkDirectory.default("directory", "").then(() => {
            done(new Error("There is no generated error"));
        }).catch((err) => {

            strictEqual(typeof err, "object", "Generated error is not as expected");
            ok(err instanceof Error, "Generated error is not as expected");

            done();

        });

    });

    it("should test with not relative directory", () => {

        return checkDirectory.default("directory", "./");

    });

    it("should test with absolute directory", () => {

        return checkDirectory.default("directory", __dirname);

    });

});
