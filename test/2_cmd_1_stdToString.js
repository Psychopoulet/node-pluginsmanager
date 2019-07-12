"use strict";

// deps

	// natives
	const { strictEqual } = require("assert");

	// locals
	const stdToString = require(require("path").join(__dirname, "..", "lib", "cmd", "stdToString.js"));

// tests

describe("stdToString", () => {

	it("should test with number", () => {
		strictEqual(stdToString(3.14), "3.14", "It does not generate the wanted string");
	});

	it("should test Buffer", () => {
		strictEqual(stdToString(Buffer.from("Test", "ascii")), "Test", "It does not generate the wanted string");
	});

	it("should test Error", () => {
		strictEqual(stdToString(new Error("Test")), "Test", "It does not generate the wanted string");
	});

	it("should test string", () => {
		strictEqual(stdToString({ "code": "Test" }), "[object Object]", "It does not generate the wanted string");
	});

});
