"use strict";

// deps

	// natives
	const { strictEqual } = require("assert");
	const { homedir } = require("os");
	const { join } = require("path");

	// externals
	const { mkdirp, remove } = require("fs-extra");

	// locals

	const GIT_DIRECTORY = join(__dirname, "..", "lib", "cjs", "cmd", "git");

		const install = require(join(GIT_DIRECTORY, "gitInstall.js"));
		const update = require(join(GIT_DIRECTORY, "gitUpdate.js"));

// const

	const MAX_TIMOUT = 30 * 1000;

	const GITHUB_USER = "Psychopoulet";
	const GITHUB_PACKAGE = "node-containerpattern";

	const PLUGINS_DIRECTORY = join(homedir(), "node-pluginsmanager");
		const DOWNLOADED_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "node-containerpattern");

// tests

describe("cmd / git", () => {

	before(() => {
		return mkdirp(PLUGINS_DIRECTORY);
	});

	after(() => {
		return remove(PLUGINS_DIRECTORY);
	});

	describe("install", () => {

		describe("missing data", () => {

			it("should test with missing directory", (done) => {

				install.default().then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with missing user", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with missing repo", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

					done();

				});

			});

		});

		describe("wrong data", () => {

			it("should test with wrong directory", (done) => {

				install.default(false).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof TypeError, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with wrong user", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, false).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof TypeError, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with wrong repo", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, false).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof TypeError, true, "generated error is not as expected");

					done();

				});

			});

		});

		describe("empty data", () => {

			it("should test with empty data", (done) => {

				install.default("").then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof Error, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with empty user", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, "").then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof Error, true, "generated error is not as expected");

					done();

				});

			});

			it("should test with empty repo", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, "").then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof Error, true, "generated error is not as expected");

					done();

				});

			});

		});

		describe("valid", () => {

			it("should test with valid data", () => {
				return install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, GITHUB_PACKAGE);
			}).timeout(MAX_TIMOUT);

			it("should test with already existing directory", (done) => {

				install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, GITHUB_PACKAGE).then(() => {
					done(new Error("tests does not generate error"));
				}).catch((err) => {

					strictEqual(typeof err, "object", "generated error is not as expected");
					strictEqual(err instanceof Error, true, "generated error is not as expected");

					done();

				});

			});

		});

	});

	describe("update", () => {

		it("should test with missing data", (done) => {

			update.default().then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof ReferenceError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test with wrong data", (done) => {

			update.default(false).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof TypeError, true, "generated error is not as expected");

				done();

			});

		});

		it("should test with empty data", (done) => {

			update.default("").then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

		it("should test with not existing directory", (done) => {

			update.default(DOWNLOADED_PLUGIN_DIRECTORY + "test", GITHUB_USER, GITHUB_PACKAGE).then(() => {
				done(new Error("tests does not generate error"));
			}).catch((err) => {

				strictEqual(typeof err, "object", "generated error is not as expected");
				strictEqual(err instanceof Error, true, "generated error is not as expected");

				done();

			});

		});

		it("should test with valid data", () => {
			return update.default(DOWNLOADED_PLUGIN_DIRECTORY);
		}).timeout(MAX_TIMOUT);

	});

});
