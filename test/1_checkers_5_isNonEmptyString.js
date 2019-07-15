"use strict";

// deps

	// natives
	const { strictEqual } = require("assert");

	// locals
	const isNonEmptyString = require(require("path").join(__dirname, "..", "lib", "checkers", "isNonEmptyString.js"));

// tests

describe("checkers / isNonEmptyString", () => {

	it("should test with empty data", (done) => {

		isNonEmptyString("string").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isNonEmptyString("string", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with empty data", (done) => {

		isNonEmptyString("string", "").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with absolute string", () => {

		return isNonEmptyString("string", "test");

	});

});