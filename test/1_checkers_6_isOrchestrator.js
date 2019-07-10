"use strict";

// deps

	// natives
	const { strictEqual } = require("assert");

	// externals
	const { Orchestrator } = require("node-pluginsmanager-plugin");

	// locals
	const isOrchestrator = require(require("path").join(__dirname, "..", "lib", "checkers", "isOrchestrator.js"));

// tests

describe("isOrchestrator", () => {

	it("should test with empty data", (done) => {

		isOrchestrator("orchestrator").then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong data", (done) => {

		isOrchestrator("orchestrator", 1234).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with wrong object", (done) => {

		isOrchestrator("orchestrator", {}).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test with Orchestrator", () => {

		return isOrchestrator("orchestrator", new Orchestrator());

	});

});
