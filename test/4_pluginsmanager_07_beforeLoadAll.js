"use strict";

// deps

	// natives
	const { join } = require("path");
	const assert = require("assert");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));

// const

	const PLUGINS_DIRECTORY = join(__dirname, "plugins");

// tests

describe("pluginsmanager / beforeLoadAll", () => {

	const pluginsManager = new PluginsManager();

	before(() => {
		pluginsManager.directory = PLUGINS_DIRECTORY;
		return pluginsManager.unloadAll();
	});

	after(() => {
		return pluginsManager.unloadAll();
	});

	it("should fail on beforeLoadAll creation", () => {

		return pluginsManager.beforeLoadAll(false).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				resolve();

			});

		});

	});

	it("should fail on beforeLoadAll call", () => {

		return pluginsManager.beforeLoadAll(() => {
			// nothing to do here
		}).then(() => {
			return pluginsManager.loadAll();
		}).then(() => {
			return Promise.reject(new Error("tests does not generate error"));
		}).catch((err) => {

			return new Promise((resolve) => {

				assert.strictEqual(err instanceof Error, true, "generated error is not an instance of Error");
				resolve();

			});

		});

	});

	it("should success on beforeLoadAll call", () => {

		return pluginsManager.beforeLoadAll(() => {
			return Promise.resolve();
		}).then(() => {
			return pluginsManager.loadAll();
		});

	});

});
