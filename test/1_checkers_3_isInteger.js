"use strict";

// deps

	// natives
	const { strictEqual } = require("assert");

	// locals
	const isInteger = require(require("path").join(__dirname, "..", "lib", "checkers", "isInteger.js"));

// tests

describe("isInteger", () => {

	it("should test with empty data", (done) => {

		isInteger("number").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isInteger("number", "1234").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isInteger("number", 0.5).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with valid data", () => {

		return isInteger("number", 1234);

	});

});
