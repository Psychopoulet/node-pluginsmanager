"use strict";

// deps

	// natives
	const { join } = require("path");
	const { lstat } = require("fs");

	// locals
	const isNonEmptyString = require(join(__dirname, "isNonEmptyString.js"));

// module

module.exports = function isDirectory (dataName, directory) {

	return isNonEmptyString(dataName, directory).then(() => {

		return new Promise((resolve) => {

			lstat(directory, (err, stats) => {
				return resolve(Boolean(!err && stats.isDirectory()));
			});

		});

	}).then((exists) => {

		return exists ? Promise.resolve() : Promise.reject(new Error(
			"\"" + dataName + "\" (" + directory + ") is not a valid directory"
		));

	});

};
