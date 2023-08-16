"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { strictEqual } = require("node:assert");

	// locals
	const stdToString = require(join(__dirname, "..", "lib", "cjs", "cmd", "stdToString.js"));

// tests

describe("cmd / stdToString", () => {

	it("should test with number", () => {
		strictEqual(stdToString.default(3.14), "3.14", "It does not generate the wanted string");
	});

	it("should test Buffer", () => {
		strictEqual(stdToString.default(Buffer.from("Test", "ascii")), "Test", "It does not generate the wanted string");
	});

	it("should test Error", () => {
		strictEqual(stdToString.default(new Error("Test")), "Test", "It does not generate the wanted string");
	});

	it("should test string", () => {
		strictEqual(stdToString.default({ "code": "Test" }), "[object Object]", "It does not generate the wanted string");
	});

});
