"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const isFunction = require(join(__dirname, "..", "lib", "checkers", "isFunction.js"));

// tests

describe("checkers / isFunction", () => {

	it("should test with empty data", (done) => {

		isFunction("function").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isFunction("function", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with valid data", () => {

		return isFunction("function", () => {
			// nothing to do here
		});

	});

});
