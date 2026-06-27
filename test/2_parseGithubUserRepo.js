// deps

    // natives
    const { deepStrictEqual, strictEqual } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const parseGithubUserRepo = require(join(__dirname, "..", "lib", "cjs", "utils", "parseGithubUserRepo.js"));

// tests

describe("parseGithubUserRepo", () => {

    it("should test without content", () => {

        const result = parseGithubUserRepo.default();

        strictEqual(typeof result, "object", "generated result type is not as expected");
        strictEqual(result, null, "generated result is not as expected");

    });

    it("should test with git protocol url", () => {

        const result = parseGithubUserRepo.default("git://github.com/Psychopoulet/node-pluginsmanager-plugin-test");

        deepStrictEqual(result, {
            "user": "Psychopoulet",
            "repo": "node-pluginsmanager-plugin-test"
        }, "generated result is not as expected");

    });

    it("should test with https url", () => {

        const result = parseGithubUserRepo.default("https://github.com/Psychopoulet/node-pluginsmanager-plugin-test.git");

        deepStrictEqual(result, {
            "user": "Psychopoulet",
            "repo": "node-pluginsmanager-plugin-test"
        }, "generated result is not as expected");

    });

    it("should test with ssh url", () => {

        const result = parseGithubUserRepo.default("git@github.com:Psychopoulet/node-pluginsmanager-plugin-test.git");

        deepStrictEqual(result, {
            "user": "Psychopoulet",
            "repo": "node-pluginsmanager-plugin-test"
        }, "generated result is not as expected");

    });

    it("should test with user/repo format", () => {

        const result = parseGithubUserRepo.default("Psychopoulet/node-pluginsmanager-plugin-test");

        deepStrictEqual(result, {
            "user": "Psychopoulet",
            "repo": "node-pluginsmanager-plugin-test"
        }, "generated result is not as expected");

    });

    it("should test with invalid url", () => {

        const result = parseGithubUserRepo.default("whatever");

        strictEqual(result, null, "generated result is not as expected");

    });

});
