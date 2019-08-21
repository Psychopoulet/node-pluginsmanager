"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const cmd = require(join(__dirname, "cmd.js"));

// module

module.exports = function npmupdate (directory) {
	return cmd(directory, [ "update", "--prod" ]);
};
