"use strict";

// deps

	// natives
	const { join } = require("path");

	// natives
	const { spawn } = require("child_process");

	// locals
	const isNonEmptyArray = require(join(__dirname, "..", "checkers", "isNonEmptyArray.js"));
	const isNonEmptyString = require(join(__dirname, "..", "checkers", "isNonEmptyString.js"));
	const stdToString = require(join(__dirname, "stdToString.js"));

// module

module.exports = function cmd (directory, command, params) {

	return isNonEmptyString("cmd/directory", directory).then(() => {
		return isNonEmptyString("cmd/command", command);
	}).then(() => {
		return isNonEmptyArray("cmd/params", params);
	}).then(() => {

		return new Promise((resolve, reject) => {

			let result = "";
			const mySpawn = spawn(command, params, {
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

	});

};
