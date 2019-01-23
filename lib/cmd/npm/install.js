"use strict";

// deps

	// locals
	const cmd = require(require("path").join(__dirname, "cmd.js"));

// module

module.exports = (directory) => {
	return cmd(directory, [ "install", "--prod" ]);
};
