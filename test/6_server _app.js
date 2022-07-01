"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const express = require("express");
	const WebSocketServer = require("ws").Server;

	// locals
	const PluginsManager = require(join(__dirname, "..", "lib", "cjs", "main.cjs"));
	const httpRequestTest = require(join(__dirname, "utils", "httpRequestTest.js"));
	const socketRequestTest = require(join(__dirname, "utils", "socketRequestTest.js"));

// consts

	const PORT = "3000";
	const PORT_SOCKETS = "3001";

// tests

describe("Server test", () => {

	const pluginsManager = new PluginsManager({
		"directory": join(__dirname, "plugins")
	});

	let runningServer = null;
	let runningSocketServer = null;

	before(() => {

		return pluginsManager.setOrder([ "test-good-plugin-without-dependencies" ]).then(() => {
			return pluginsManager.loadAll();
		}).then(() => {
			return pluginsManager.initAll();
		}).then(() => {

			return new Promise((resolve) => {

				runningServer = express().get("/", (req, res) => {

					res.writeHead(200, {
						"Content-Type": "application/json; charset=utf-8"
					});

					res.end(JSON.stringify("Hello World"));

				}).use((req, res, next) => {
					pluginsManager.appMiddleware(req, res, next);
				}).use((req, res) => {

					res.writeHead(404, {
						"Content-Type": "application/json; charset=utf-8"
					});

					res.end(JSON.stringify({
						"code": "404",
						"message": "Unknown page"
					}));

				});

				resolve();

			});

		}).then(() => {

			return new Promise((resolve) => {
				runningServer = runningServer.listen(PORT, resolve);
			});

		}).then(() => {

			runningSocketServer = new WebSocketServer({
				"port": PORT_SOCKETS
			});

			pluginsManager.socketMiddleware(runningSocketServer);

		});

	});

	after(() => {

		return Promise.resolve().then(() => {

			return runningServer ? new Promise((resolve) => {
				runningServer.close(resolve);
			}).then(() => {
				runningServer = null;
			}) : Promise.resolve();

		}).then(() => {

			return runningSocketServer ? new Promise((resolve) => {
				runningSocketServer.close(resolve);
			}).then(() => {
				runningSocketServer = null;
			}) : Promise.resolve();

		}).then(() => {
			return pluginsManager.releaseAll();
		}).then(() => {
			return pluginsManager.destroyAll();
		});

	});

	it("should test request with default root", () => {

		return httpRequestTest("/", "get", null, 200, "OK", "Hello World");

	});

	it("should test request with unknown root", () => {

		return httpRequestTest("/vkesvrhbselirv", "get", null, 404, "Not Found", {
			"code": "404",
			"message": "Unknown page"
		});

	});

	it("should test request with put root", () => {

		return httpRequestTest("/test-good-plugin/create", "put", null, 201, "Created");

	});

	it("should test normal get root", () => {

		return httpRequestTest("/test-good-plugin-without-dependencies/get", "get", null, 200, "OK", [ "test" ]);

	});

	it("should test socket server", () => {

		return socketRequestTest("ping", "pong");

	});

});
