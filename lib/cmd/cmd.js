"use strict";

// deps

	// natives
	const { spawn } = require("child_process");

	// locals
	const stdToString = require(require("path").join(__dirname, "stdToString.js"));

// module

module.exports = (directory, cmd, params) => {

	if ("undefined" === typeof directory) {
		return Promise.reject(new ReferenceError("Missing \"directory\" parameter"));
	}
		else if ("string" !== typeof directory) {
			return Promise.reject(new TypeError("\"directory\" parameter is not a string"));
		}
		else if ("" === directory.trim()) {
			return Promise.reject(new Error("\"directory\" parameter is empty"));
		}

	else if ("undefined" === typeof cmd) {
		return Promise.reject(new ReferenceError("Missing \"cmd\" parameter"));
	}
		else if ("string" !== typeof cmd) {
			return Promise.reject(new TypeError("\"cmd\" parameter is not a string"));
		}
		else if ("" === cmd.trim()) {
			return Promise.reject(new Error("\"cmd\" parameter is empty"));
		}

	else if ("undefined" === typeof params) {
		return Promise.reject(new ReferenceError("Missing \"params\" parameter"));
	}
		else if ("object" !== typeof params || !(params instanceof Array)) {
			return Promise.reject(new TypeError("\"params\" parameter is not an Array"));
		}
		else if (!params.length) {
			return Promise.reject(new Error("\"params\" parameter is empty"));
		}

	else {

		return new Promise((resolve, reject) => {

			let result = "";
			const mySpawn = spawn(cmd, params, {
				"cwd": directory
			}).on("error", (err) => {
				result += stdToString(err);
			}).on("close", (code) => {
				return code ? reject(new Error(result)) : resolve();
			});

			mySpawn.stderr.on("data", (msg) => {
				result += stdToString(msg);
			});

		});

	}

};
