"use strict";

// deps

	// natives
	const assert = require("node:assert");
	const { homedir } = require("node:os");
	const { join } = require("node:path");
	const { mkdir, writeFile, rm } = require("node:fs/promises");

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

		return mkdir(PLUGINS_DIRECTORY, {
			"recursive": true
		}).then(() => {

			return writeFile(join(PLUGINS_DIRECTORY, "package.json"), JSON.stringify({
				"dependencies": {
					"node-promfs": "3.6.2"
				}
			}), "utf-8");

		});

	});

	after(() => {

		return rm(PLUGINS_DIRECTORY, {
			"recursive": true
		});

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
