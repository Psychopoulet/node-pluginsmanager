"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const isAbsoluteDirectory = require(join(__dirname, "..", "lib", "checkers", "isAbsoluteDirectory.js"));

// tests

describe("checkers / isAbsoluteDirectory", () => {

	it("should test with empty data", (done) => {

		isAbsoluteDirectory("directory").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isAbsoluteDirectory("directory", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with empty data", (done) => {

		isAbsoluteDirectory("directory", "").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with not absolute directory", (done) => {

		isAbsoluteDirectory("directory", "./").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with absolute directory", () => {

		return isAbsoluteDirectory("directory", __dirname);

	});

});
