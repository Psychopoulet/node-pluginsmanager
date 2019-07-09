"use strict";

// deps

	// natives
	const { isAbsolute } = require("path");

	// externals
	const { isDirectoryProm } = require("node-promfs");

// module

module.exports = function isAbsoluteDirectory (dataName, directory) {

	return isDirectoryProm(directory).then((exists) => {
		return exists ? Promise.resolve() : Promise.reject(new Error("\"" + dataName + "\" does not exist"));
	}).then(() => {
		return isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error("\"" + dataName + "\" is not an absolute path"));
	});

};
