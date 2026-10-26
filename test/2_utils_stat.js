// deps

    // natives
    const { rejects } = require("node:assert");
    const { join } = require("node:path");

    // locals
    const getLatestGithubTag = require(join(__dirname, "..", "lib", "src", "utils", "getLatestGithubTag.ts")).default;
    const isDirectory = require(join(__dirname, "..", "lib", "src", "utils", "isDirectory.ts")).default;
    const isFile = require(join(__dirname, "..", "lib", "src", "utils", "isFile.ts")).default;

// private

    const _originalFetch = globalThis.fetch;

    function _mockFetch (response) {

        globalThis.fetch = () => {
            return Promise.resolve(response);
        };

    }

// tests

describe("isDirectory", () => {

    it("should reject a missing directory", () => {

        return rejects(isDirectory(), (err) => {
            return err instanceof ReferenceError;
        });

    });

    it("should reject a directory that is not a string", () => {

        return rejects(isDirectory(false), (err) => {
            return err instanceof TypeError;
        });

    });

    it("should reject an empty directory", () => {

        return rejects(isDirectory("   "), (err) => {
            return err instanceof RangeError;
        });

    });

});

describe("isFile", () => {

    it("should reject a missing path", () => {

        return rejects(isFile(), (err) => {
            return err instanceof ReferenceError;
        });

    });

    it("should reject a path that is not a string", () => {

        return rejects(isFile(false), (err) => {
            return err instanceof TypeError;
        });

    });

    it("should reject an empty path", () => {

        return rejects(isFile("   "), (err) => {
            return err instanceof RangeError;
        });

    });

});

describe("getLatestGithubTag", () => {

    afterEach(() => {
        globalThis.fetch = _originalFetch;
    });

    it("should reject when the github request fails", () => {

        _mockFetch({
            "ok": false,
            "statusText": "Not Found",
            "json": () => {
                return Promise.resolve([]);
            }
        });

        return rejects(getLatestGithubTag("Psychopoulet", "missing-repo"), (err) => {

            return err instanceof Error
                && -1 < err.message.indexOf("Failed to fetch");

        });

    });

    it("should reject when the repository has no tags", () => {

        _mockFetch({
            "ok": true,
            "statusText": "OK",
            "json": () => {
                return Promise.resolve([]);
            }
        });

        return rejects(getLatestGithubTag("Psychopoulet", "empty-tags"), (err) => {

            return err instanceof Error
                && -1 < err.message.indexOf("No tags found");

        });

    });

});
