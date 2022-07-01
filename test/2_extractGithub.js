"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const extractGithub = require(join(__dirname, "..", "lib", "cjs", "extractGithub.js"));

// tests

describe("extractGithub", () => {

	it("should test without content", () => {

		const github = extractGithub.default();

		strictEqual(typeof github, "string", "generated github type is not as expected");
		strictEqual(github, "", "generated github is not as expected");

	});

	it("should test with github", () => {

		const github = extractGithub.default({
			"github": "test"
		});

		strictEqual(typeof github, "string", "generated github type is not as expected");
		strictEqual(github, "test", "generated github is not as expected");

	});

	it("should test with repository", () => {

		const github = extractGithub.default({
			"repository": "test"
		});

		strictEqual(typeof github, "string", "generated github type is not as expected");
		strictEqual(github, "test", "generated github is not as expected");

	});

	it("should test with repository", () => {

		const github = extractGithub.default({
			"repository": {
				"url": "test"
			}
		});

		strictEqual(typeof github, "string", "generated github type is not as expected");
		strictEqual(github, "test", "generated github is not as expected");

	});

});
