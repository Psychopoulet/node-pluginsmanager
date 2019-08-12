"use strict";

// deps

	// natives
	const { isAbsolute } = require("path");

	// externals
	const { isDirectoryProm } = require("node-promfs");

// module

module.exports = function isAbsoluteDirectory (dataName, directory) {

	return isDirectoryProm(directory).then((exists) => {

		return exists ? Promise.resolve() : Promise.reject(new Error(
			"\"" + dataName + "\" (" + directory + ") is not a valid directory"
		));

	}).then(() => {

		return isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error(
			"\"" + dataName + "\" (" + directory + ") is not an absolute path"
		));

	});

};
