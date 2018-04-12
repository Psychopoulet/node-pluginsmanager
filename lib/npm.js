
"use strict";

// deps

	const { exec } = require("child_process");

	const { mkdirpProm } = require("node-promfs");

	const stdToString = require(require("path").join(__dirname, "stdToString.js"));

// module

module.exports = (directory, command) => {

	return mkdirpProm(directory).then(() => {

		return new Promise((resolve, reject) => {

			exec("npm " + command, {
				"cwd": directory
			}, (err, stdout, stderr) => {
				return err ? reject(new Error(stdToString(stderr))) : resolve();
			});

		});

	});

};
