"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { strictEqual } = require("node:assert");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const checkOrchestrator = require(join(__dirname, "..", "lib", "cjs", "checkers", "checkOrchestrator.js"));

// tests

describe("checkers / checkOrchestrator", () => {

	it("should test with empty data", (done) => {

		checkOrchestrator.default("orchestrator").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		checkOrchestrator.default("orchestrator", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong object", (done) => {

		checkOrchestrator.default("orchestrator", {}).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with Orchestrator", () => {

		return checkOrchestrator.default("orchestrator", new Orchestrator());

	});

});
