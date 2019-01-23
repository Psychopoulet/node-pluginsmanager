"use strict";

// deps

	// natives
	const { basename, isAbsolute, join } = require("path");

	// externals
	const { isDirectoryProm } = require("node-promfs");

	// locals
	const Plugin = require(join(__dirname, "plugin.js"));

// module

module.exports = (directory) => {

	return isDirectoryProm(directory).then((exists) => {
		return exists ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" does not exist"));
	}).then(() => {
		return isAbsolute(directory) ? Promise.resolve() : Promise.reject(new Error("\"" + directory + "\" is not an absolute path"));
	}).then(() => {

		const _Plugin = require(directory);
		let oPlugin = null;

		return Promise.resolve().then(() => {

			return "function" !== typeof _Plugin ?
				Promise.reject(new Error("\"" + directory + "\" is not a function")) :
				Promise.resolve();

		}).then(() => {

			oPlugin = new _Plugin();
			oPlugin.directory = directory;
			oPlugin.name = basename(directory);

			return !(oPlugin instanceof Plugin) ?
				Promise.reject(new Error("\"" + basename(directory) + "\" is not a plugin class")) :
				oPlugin.loadDataFromPackageFile();

		});

	});

};
