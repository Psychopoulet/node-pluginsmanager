"use strict";

// deps

	// natives
	const { join } = require("path");
	const { createServer } = require("http");

	// externals
	const express = require("express");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));
	const httpRequestTest = require(join(__dirname, "utils", "httpRequestTest.js"));

// consts

	const PORT = "3000";

	const RESPONSE_CODE = 200;
	const RESPONSE_CONTENT = "Hello World";

// tests

describe("Server test", () => {

	describe("http", () => {

		const pluginsManager = new PluginsManager({
			"directory": join(__dirname, "plugins")
		});

		let runningServer = null;

		before(() => {

			return pluginsManager.loadAll().then(() => {
				return pluginsManager.initAll();
			}).then(() => {

				return new Promise((resolve) => {

					runningServer = createServer((req, res) => {

						if (!pluginsManager.httpMiddleware(req, res)) {

							res.writeHead(RESPONSE_CODE, {
								"Content-Type": "text/plain; charset=utf-8"
							});

							res.end(RESPONSE_CONTENT);

						}

					});

					resolve();

				});

			}).then(() => {

				return new Promise((resolve) => {
					runningServer.listen(PORT, resolve);
				});

			});

		});

		after(() => {

			return new Promise((resolve) => {
				runningServer.close(resolve);
			}).then(() => {
				runningServer = null;
			}).then(() => {
				return pluginsManager.releaseAll();
			}).then(() => {
				return pluginsManager.destroyAll();
			});

		});

		it("should test normal check", () => {

			return httpRequestTest("/TestGoodPlugin", 201, "Created").then(() => {

				return httpRequestTest("/TestGoodPluginWithoutDependencies", 200, "OK");

			}).then(() => {

				return httpRequestTest("/", RESPONSE_CODE, "OK");

			});

		});

	});

	describe("app", () => {

		const pluginsManager = new PluginsManager({
			"directory": join(__dirname, "plugins")
		});

		let runningServer = null;

		before(() => {

			return pluginsManager.loadAll().then(() => {
				return pluginsManager.initAll();
			}).then(() => {

				return new Promise((resolve) => {

					runningServer = express().use((req, res, next) => {

						pluginsManager.appMiddleware(req, res, next);

					}).get("/", (req, res) => {

						res.writeHead(RESPONSE_CODE, {
							"Content-Type": "text/plain; charset=utf-8"
						});

						res.end(RESPONSE_CONTENT);

					}).use((err, req, res, next) => {

						(0, console).log(err.message ? err.message : err);

						res.writeHead(500, {
							"Content-Type": "text/plain; charset=utf-8"
						});

						res.end("Something broke !");

						next();

					});

					resolve();

				});

			}).then(() => {

				return new Promise((resolve) => {
					runningServer = runningServer.listen(PORT, resolve);
				});

			});

		});

		after(() => {

			return new Promise((resolve) => {
				runningServer.close(resolve);
			}).then(() => {
				runningServer = null;
			}).then(() => {
				return pluginsManager.releaseAll();
			}).then(() => {
				return pluginsManager.destroyAll();
			});

		});

		it("should test normal check", () => {

			return httpRequestTest("/TestGoodPlugin", 201, "Created").then(() => {

				return httpRequestTest("/TestGoodPluginWithoutDependencies", 200, "OK");

			}).then(() => {

				return httpRequestTest("/", RESPONSE_CODE, "OK");

			});

		});

	});

});
