"use strict";

// deps

	// natives
	const { join } = require("path");

	// locals
	const isDirectory = require(join(__dirname, "..", "..", "checkers", "isDirectory.js"));
	const cmd = require(join(__dirname, "..", "cmd.js"));

// module

module.exports = function gitupdate (directory) {

	return isDirectory("cmd/git/update/directory", directory).then(() => {

		// git update
		return cmd(directory, "git", [ "pull" ]);

	});

};
