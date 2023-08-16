"use strict";

// deps

	// natives
	const { strictEqual } = require("node:assert");

	// externals
	const WebSocket = require("ws");

// consts

	const PORT = 3001;
	const MAIN_URL = "ws://127.0.0.1:" + PORT;

// module

module.exports = function socketRequestTest (requestName, returnName) {

	const client = new WebSocket(MAIN_URL);

	// connection
	return new Promise((resolve) => {

		client.on("open", () => {

			(0, console).log("client", "socket", "open");

			resolve();

		});

	// send & wait for response
	}).then(() => {

		return new Promise((resolve, reject) => {

			client.on("message", (payload) => {

				(0, console).log("client", "socket", "message", payload);

				try {

					const req = JSON.parse(payload);

					strictEqual(req.name, returnName, "The name is not " + returnName);

					resolve();

				}
				catch (e) {
					reject(e);
				}

			});

			client.send(JSON.stringify({
				"name": requestName
			}));

		});

	// send & wait for response
	}).then(() => {

		return new Promise((resolve) => {

			client.on("close", () => {

				(0, console).log("client", "socket", "close");

				resolve();

			}).close();

		});

	});

};
