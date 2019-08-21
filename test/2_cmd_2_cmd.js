"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const cmd = require(join(__dirname, "..", "lib", "cmd", "cmd.js"));

// tests

describe("cmd / cmd", () => {

	describe("directory", () => {

		it("should test without directory", (done) => {

			cmd().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong directory", (done) => {

			cmd(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty directory", (done) => {

			cmd("").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test invalid directory", (done) => {

			cmd(join(__dirname, "sifnzsoifgevnzoeifnz")).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("command", () => {

		it("should test missing command", (done) => {

			cmd("test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong command", (done) => {

			cmd("test", false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty command", (done) => {

			cmd("test", "").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("command", () => {

		it("should test missing params", (done) => {

			cmd("test", "test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

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

		it("should test empty params", (done) => {

			cmd("test", "test", []).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "generated error is not as expected");
				assert.strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("execute", () => {

		it("should test node version", () => {

			return cmd("./", "node", [ "-v" ]);

		});

	});

});
