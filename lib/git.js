
"use strict";

// deps

	const { spawn } = require("child_process");

	const stdToString = require(require("path").join(__dirname, "stdToString.js"));

// module

module.exports = (params) => {

	return new Promise((resolve, reject) => {

		let result = "";
		const mySpawn = spawn("git", params).on("error", (err) => {
			result += stdToString(err);
		}).on("close", (code) => {
			return code ? reject(new Error(result)) : resolve();
		});

		mySpawn.stderr.on("data", (msg) => {
			result += stdToString(msg);
		});

	});

};
