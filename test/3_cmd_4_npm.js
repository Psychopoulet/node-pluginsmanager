"use strict";

// deps

	// natives
	const assert = require("assert");
	const { homedir } = require("os");
	const { join } = require("path");

	// externals
	const { mkdirp, remove, writeJson } = require("fs-extra");

	// locals

	const NPM_DIRECTORY = join(__dirname, "..", "lib", "cjs", "cmd", "npm");

		const cmd = require(join(NPM_DIRECTORY, "npmCmd.js"));
		const install = require(join(NPM_DIRECTORY, "npmInstall.js"));
		const update = require(join(NPM_DIRECTORY, "npmUpdate.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const PLUGINS_DIRECTORY = join(homedir(), "node-pluginsmanager");

// tests

describe("cmd / npm", () => {

	before(() => {

		return mkdirp(PLUGINS_DIRECTORY).then(() => {

			return writeJson(join(PLUGINS_DIRECTORY, "package.json"), {
				"dependencies": {
					"node-promfs": "3.6.2"
				}
			});

		});

	});

	after(() => {
		return remove(PLUGINS_DIRECTORY);
	});

	it("should test wrong repository", (done) => {

		cmd.default("zfefzefzefz").then(() => {
			done(new Error("Wrong parameters used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	});

	it("should test right install", () => {
		return install.default(PLUGINS_DIRECTORY);
	}).timeout(MAX_TIMOUT);

	it("should test right update", () => {
		return update.default(PLUGINS_DIRECTORY);
	}).timeout(MAX_TIMOUT);

});
