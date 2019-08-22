"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const cmd = require(join(__dirname, "cmd.js"));

// module

module.exports = function npminstall (directory) {
	return cmd(directory, [ "install", "--prod" ]);
};
