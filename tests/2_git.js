"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

	const { rmdirpProm } = require("node-promfs");

	const git = require(join(__dirname, "..", "lib", "git.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

// private

	const pluginDirectory = join(__dirname, "plugins", "pluginsmanager");

// tests

describe("git", () => {

	afterEach(() => {
		return rmdirpProm(pluginDirectory);
	});

	it("should test wrong repository", (done) => {

		git([ "zfefzefzefz" ]).then(() => {
			done(new Error("Wrong parameters used"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not an object");
			assert.strictEqual(err instanceof Error, true, "Generated error is not an Error");

			done();

		});

	}).timeout(MAX_TIMOUT);

	it("should test right repository", () => {

		return git([
			"-c", "core.quotepath=false", "clone", "--recursive", "--depth", "1",
			"https://github.com/Psychopoulet/node-pluginsmanager/", pluginDirectory
		]);

	}).timeout(MAX_TIMOUT);

});
