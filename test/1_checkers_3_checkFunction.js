"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const checkFunction = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkFunction.js"));

// tests

describe("checkers / checkFunction", () => {

	it("should test with empty data", (done) => {

		checkFunction.default("function").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		checkFunction.default("function", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with valid data", () => {

		return checkFunction.default("function", () => {
			// nothing to do here
		});

	});

});
