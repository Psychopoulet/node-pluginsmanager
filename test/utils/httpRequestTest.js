/*
	eslint max-params: 0
*/

"use strict";

// deps

	// natives
	const { request } = require("node:http");
	const { parse } = require("node:url");
	const { strictEqual } = require("node:assert");

// consts

	const MAIN_URL = "http://127.0.0.1:3000";

// module

module.exports = function httpRequestTest (urlpath, method, params, returnCode, returnResponse, returnContent) {

	const url = parse(MAIN_URL + urlpath);

	return new Promise((resolve, reject) => {

		const bodyParams = "undefined" !== typeof params ? JSON.stringify(params) : "";

		const opts = {
			"protocol": url.protocol,
			"hostname": url.hostname,
			"port": url.port,
			"path": url.path,
			"query": url.query,
			"method": method.toUpperCase(),
			"headers": {
				"Content-Type": "application/json; charset=utf-8",
				"Content-Length": Buffer.byteLength(bodyParams)
			}
		};

		const req = request(opts, (res) => {

			try {

				strictEqual(res.statusCode, returnCode, "The statusCode is not " + returnCode);
				strictEqual(res.statusMessage, returnResponse, "The statusMessage is not valid");

				strictEqual(typeof res.headers, "object", "The headers are not an object");
				strictEqual(
					res.headers["content-type"].toLowerCase(),
					"application/json; charset=utf-8",
					"The content-type header are not json/utf8"
				);

				res.setEncoding("utf8");

				let rawData = "";
				res.on("data", (chunk) => {
					rawData += chunk;
				}).on("end", () => {

					try {

						strictEqual(typeof rawData, "string", "The returned content is not a string");

						if (res.headers["content-length"]) {

							strictEqual(
								parseInt(res.headers["content-length"], 10),
								Buffer.byteLength(rawData),
								"The content-length header are not as expected"
							);

						}

						if ("undefined" !== typeof returnContent) {
							strictEqual(rawData, JSON.stringify(returnContent), "The returned content is not as expected");
						}

						resolve();

					}
					catch (_e) {
						reject(_e);
					}

				});

			}
			catch (e) {
				reject(e);
			}

		});

		req.on("error", reject);

		req.write(bodyParams);
		req.end();

	});

};
