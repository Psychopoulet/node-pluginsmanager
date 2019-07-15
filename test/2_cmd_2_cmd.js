"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const cmd = require(join(__dirname, "..", "lib", "cmd", "cmd.js"));

// tests

describe("cmd / cmd", () => {

	describe("missing data", () => {

		it("should test missing directory", (done) => {

			cmd().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test missing cmd", (done) => {

			cmd("test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test missing params", (done) => {

			cmd("test", "test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("wrong data", () => {

		it("should test wrong directory", (done) => {

			cmd(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong cmd", (done) => {

			cmd("test", false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong params", (done) => {

			cmd("test", "test", false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("empty data", () => {

		it("should test empty directory", (done) => {

			cmd("").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty cmd", (done) => {

			cmd("test", "").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty params", (done) => {

			cmd("test", "test", []).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

	});

});
