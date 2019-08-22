"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const isDirectory = require(join(__dirname, "..", "..", "checkers", "isDirectory.js"));
	const cmd = require(join(__dirname, "..", "cmd.js"));

// module

module.exports = function npmcmd (directory, params) {

	return isDirectory("cmd/npm/cmd/directory", directory).then(() => {

		// npm install
		return cmd(directory, (/^win/).test((0, process).platform) ? "npm.cmd" : "npm", params);

	});

};
