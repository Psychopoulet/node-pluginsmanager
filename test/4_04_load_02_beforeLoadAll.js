"use strict";

// deps

	// natives
	const { join } = require("path");
	const { strictEqual } = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("pluginsmanager / beforeLoadAll", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	after(() => {
		return pluginsManager.destroyAll();
	});

	it("should test empty data", (done) => {

		pluginsManager.beforeLoadAll().then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should test wrong data", (done) => {

		pluginsManager.beforeLoadAll(false).then(() => {
			done(new Error("There is no generated error"));
		}).catch((err) => {

			strictEqual(typeof err, "object", "Generated error is not as expected");
			strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should success on beforeLoadAll call without Promise", () => {

		return pluginsManager.beforeLoadAll(() => {
			// nothing to do here
		}).then(() => {
			return pluginsManager.loadAll();
		});

	});

	it("should success on beforeLoadAll call with Promise", () => {

		return pluginsManager.beforeLoadAll(() => {
			return Promise.resolve();
		}).then(() => {
			return pluginsManager.loadAll();
		});

	});

});
