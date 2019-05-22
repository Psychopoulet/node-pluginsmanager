"use strict";

// deps

	// natives
	const { basename, isAbsolute } = require("path");

	// externals
	const { isDirectoryProm } = require("node-promfs");

// module

module.exports = (directory) => {

	return isDirectoryProm(directory).then((exists) => {
		return exists ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" does not exist"));
	}).then(() => {
		return isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" is not an absolute path"));
	}).then(() => {

		const Plugin = require(directory);
		let plugin = null;

		return Promise.resolve().then(() => {

			return "function" !== typeof Plugin ?
				Promise.reject(new Error("\"" + directory + "\" is not a function")) :
				Promise.resolve();

		}).then(() => {

			plugin = new Plugin(directory);
			plugin.name = basename(directory);

			return plugin.loadDataFromPackageFile();

		});

	});

};
