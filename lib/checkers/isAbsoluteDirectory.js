"use strict";

// deps

	// natives
	const { join, isAbsolute } = require("path");

	// locals
	const isDirectory = require(join(__dirname, "isDirectory.js"));

// module

module.exports = function isAbsoluteDirectory (dataName, directory) {

	return isDirectory(dataName, directory).then(() => {

		return new Promise((resolve, reject) => {

			return isAbsolute(directory) ? resolve() : reject(new Error(
				"\"" + dataName + "\" (" + directory + ") is not an absolute path"
			));

		});

	});

};
