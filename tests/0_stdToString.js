"use strict";

// deps

	const assert = require("assert");

	const stdToString = require(require("path").join(__dirname, "..", "lib", "stdToString.js"));

// tests

describe("stdToString", () => {

	it("should test with number", () => {
		assert.strictEqual(stdToString(3.14), "3.14", "It does not generate the wanted string");
	});

	it("should test Buffer", () => {
		assert.strictEqual(stdToString(Buffer.from("Test", "ascii")), "Test", "It does not generate the wanted string");
	});

	it("should test Error", () => {
		assert.strictEqual(stdToString(new Error("Test")), "Test", "It does not generate the wanted string");
	});

	it("should test string", () => {
		assert.strictEqual(stdToString({ "code": "Test" }), "[object Object]", "It does not generate the wanted string");
	});

});
