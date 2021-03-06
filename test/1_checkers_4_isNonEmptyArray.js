"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const isNonEmptyArray = require(join(__dirname, "..", "lib", "checkers", "isNonEmptyArray.js"));

// tests

describe("checkers / isNonEmptyArray", () => {

	it("should test with empty data", (done) => {

		isNonEmptyArray("array").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isNonEmptyArray("array", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isNonEmptyArray("array", {}).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with empty data", (done) => {

		isNonEmptyArray("array", []).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof RangeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with absolute array", () => {

		return isNonEmptyArray("array", [ "test" ]);

	});

});
