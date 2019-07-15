"use strict";

// deps

	// natives
	const { join } = require("path");
	const { createServer } = require("http");

	// externals
	const express = require("express");

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "main.js"));
	const httpRequestTest = require(join(__dirname, "..", "node_modules", "node-pluginsmanager-plugin", "test", "utils", "httpRequestTest.js"));

// consts

	const PORT = "3000";

	const RESPONSE_CODE = 200;
	const RESPONSE_CONTENT = "Hello World";

// tests

describe("Server test", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	describe("http", () => {

		const runningServer = createServer((req, res) => {

			if (!pluginsManager.httpMiddleware(req, res)) {

				res.writeHead(RESPONSE_CODE, {
					"Content-Type": "text/html; charset=utf-8"
				});

				res.write(RESPONSE_CONTENT);
				res.end();

			}

		});

		beforeEach(() => {

			return new Promise((resolve) => {

				runningServer.listen(PORT, resolve);

			});

		});

		afterEach(() => {

			return pluginsManager.releaseAll().then(() => {

				return pluginsManager.destroyAll();

			}).then(() => {

				return new Promise((resolve) => {

					runningServer.close(resolve);

				});

			});

		});

		it("should test normal check", () => {

			return pluginsManager.initAll().then(() => {

				return httpRequestTest("/TestGoodPlugin", 201, "Created");

			}).then(() => {

				return httpRequestTest("/TestGoodPluginWithoutDependencies", 200, "OK");

			}).then(() => {

				return httpRequestTest("/", RESPONSE_CODE, "OK");

			});

		});

	});

	describe("app", () => {

		let runningServer = express().use((req, res, next) => {

			pluginsManager.appMiddleware(req, res, next);

		}).get("/", (req, res) => {

			res.status(RESPONSE_CODE).send(RESPONSE_CONTENT);

		}).use((err, req, res, next) => {

			(0, console).log(err.message ? err.message : err);

			res.status(500).send("Something broke !");

			next();

		});

		beforeEach(() => {

			return new Promise((resolve) => {

				runningServer = runningServer.listen(PORT, resolve);

			});

		});

		afterEach(() => {

			return pluginsManager.releaseAll().then(() => {

				return pluginsManager.destroyAll();

			}).then(() => {

				return new Promise((resolve) => {

					runningServer.close(resolve);

				});

			});

		});

		it("should test normal check", () => {

			return pluginsManager.initAll().then(() => {

				return httpRequestTest("/TestGoodPlugin", 201, "Created");

			}).then(() => {

				return httpRequestTest("/TestGoodPluginWithoutDependencies", 200, "OK");

			}).then(() => {

				return httpRequestTest("/", RESPONSE_CODE, "OK");

			});

		});

	});

});
