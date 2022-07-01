"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const cmd = require(join(__dirname, "..", "lib", "cjs", "cmd", "cmd.js"));

// tests

describe("cmd / cmd", () => {

	describe("directory", () => {

		it("should test without directory", (done) => {

			cmd.default().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong directory", (done) => {

			cmd.default(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty directory", (done) => {

			cmd.default("").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test invalid directory", (done) => {

			cmd.default(join(__dirname, "sifnzsoifgevnzoeifnz")).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("command", () => {

		it("should test missing command", (done) => {

			cmd.default("test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong command", (done) => {

			cmd.default("test", false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty command", (done) => {

			cmd.default("test", "").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("command", () => {

		it("should test missing params", (done) => {

			cmd.default("test", "test").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test wrong params", (done) => {

			cmd.default("test", "test", false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test empty params", (done) => {

			cmd.default("test", "test", []).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof RangeError, true, "generated error is not as expected");

				done();

			});

		});

	});

	describe("execute", () => {

		it("should test wrong command", (done) => {

			cmd.default("./", "node", [ "-tzfzefzef" ]).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

		it("should test node version", () => {

			return cmd.default("./", "node", [ "-v" ]);

		});

	});

});
