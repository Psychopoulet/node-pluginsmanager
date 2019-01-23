"use strict";

// deps

	// externals
	const { isDirectoryProm } = require("node-promfs");

	// locals
	const cmd = require(require("path").join(__dirname, "..", "cmd.js"));

// module

module.exports = (directory) => {

	return isDirectoryProm(directory).then((exists) => {

		return !exists ?
			Promise.reject(new Error("\"" + directory + "\" does not exist")) :
			Promise.resolve();

	}).then(() => {

		// git update
		return cmd(directory, "git", [ "pull" ]);

	});

};
