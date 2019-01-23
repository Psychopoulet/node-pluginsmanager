"use strict";

// deps

	// natives
	const { dirname } = require("path");

	// externals
	const { isDirectoryProm } = require("node-promfs");

	// locals
	const cmd = require(require("path").join(__dirname, "..", "cmd.js"));

// module

module.exports = (directory, user, repo) => {

	if ("undefined" === typeof directory) {
		return Promise.reject(new ReferenceError("Missing \"directory\" parameter"));
	}
		else if ("string" !== typeof directory) {
			return Promise.reject(new TypeError("\"directory\" parameter is not a string"));
		}
		else if ("" === directory.trim()) {
			return Promise.reject(new TypeError("\"directory\" parameter is empty"));
		}

	else if ("undefined" === typeof user) {
		return Promise.reject(new ReferenceError("Missing \"user\" parameter"));
	}
		else if ("string" !== typeof user) {
			return Promise.reject(new TypeError("\"user\" parameter is not a string"));
		}
		else if ("" === user.trim()) {
			return Promise.reject(new TypeError("\"user\" parameter is empty"));
		}

	else if ("undefined" === typeof repo) {
		return Promise.reject(new ReferenceError("Missing \"repo\" parameter"));
	}
		else if ("string" !== typeof repo) {
			return Promise.reject(new TypeError("\"repo\" parameter is not a string"));
		}
		else if ("" === repo.trim()) {
			return Promise.reject(new TypeError("\"repo\" parameter is empty"));
		}

	else {

		return isDirectoryProm(directory).then((exists) => {

			return exists ?
				Promise.reject(new Error("\"" + directory + "\" aldready exists")) :
				Promise.resolve();

		}).then(() => {

			// git clone
			return cmd(dirname(directory), "git", [
				"-c",
				"core.quotepath=false",
				"clone",
				"--recursive",
				"--depth",
				"1",
				"git://github.com/" + user + "/" + repo + ".git",
				directory
			]);

		});

	}

};
