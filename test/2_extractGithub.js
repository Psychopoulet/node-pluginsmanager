"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const extractGithub = require(join(__dirname, "..", "lib", "cjs", "extractGithub.js"));

// tests

describe("extractGithub", () => {

	it("should test without content", () => {

		const github = extractGithub.default();

		assert.strictEqual(typeof err, "string", "generated github type is not as expected");
		assert.strictEqual(github, "", "generated github is not as expected");

	});

	it("should test with github", () => {

		const github = extractGithub.default({
			"github": "test"
		});

		assert.strictEqual(typeof err, "string", "generated github type is not as expected");
		assert.strictEqual(github, "test", "generated github is not as expected");

	});

	it("should test with repository", () => {

		const github = extractGithub.default({
			"repository": "test"
		});

		assert.strictEqual(typeof err, "string", "generated github type is not as expected");
		assert.strictEqual(github, "test", "generated github is not as expected");

	});

	it("should test with repository", () => {

		const github = extractGithub.default({
			"repository": {
				"url": "test"
			}
		});

		assert.strictEqual(typeof err, "string", "generated github type is not as expected");
		assert.strictEqual(github, "test", "generated github is not as expected");

	});

});
