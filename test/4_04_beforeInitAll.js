"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / beforeInitAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	after(() => {

		return pluginsManager.releaseAll().then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test empty data", (done) => {

		pluginsManager.beforeInitAll().then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test wrong data", (done) => {

		pluginsManager.beforeInitAll(false).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should success on beforeInitAll call", () => {

		return pluginsManager.beforeInitAll(() => {
			// nothing to do here
		}).then(() => {
			return pluginsManager.initAll();
		});

	});

	it("should success on beforeInitAll call", () => {

		return pluginsManager.beforeInitAll(() => {
			return Promise.resolve();
		}).then(() => {
			return pluginsManager.initAll();
		});

	});

});
