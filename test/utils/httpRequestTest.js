"use strict";

// deps

	// natives
	const { get } = require("http");
	const { strictEqual } = require("assert");

// consts

	const PORT = 3000;
	const MAIN_URL = "http://127.0.0.1:" + PORT;
	const RESPONSE_CONTENT = "Hello World";

// module

module.exports = function httpRequestTest (urlpath, returnCode, returnResponse) {

	return new Promise((resolve, reject) => {

		get(MAIN_URL + urlpath, (res) => {

			try {

				strictEqual(res.statusCode, returnCode, "The statusCode is not " + returnCode);
				strictEqual(res.statusMessage, returnResponse, "The statusMessage is not valid");
				strictEqual(typeof res.headers, "object", "The headers are not an object");
				strictEqual(
					res.headers["content-type"].toLowerCase(),
					"text/plain; charset=utf-8",
					"The content-type header are not text/utf8"
				);

				res.setEncoding("utf8");

				let rawData = "";

				res.on("data", (chunk) => {
					rawData += chunk;
				}).on("end", () => {

					try {

						strictEqual(typeof rawData, "string", "The returned content is not a text");
						strictEqual(rawData, RESPONSE_CONTENT, "The returned content is not as expected");

						resolve();

					}
					catch (_e) {
						reject(_e.message ? _e.message : _e);
					}

				});

			}
			catch (e) {
				reject(e.message ? e.message : e);
			}

		});

	});

};
