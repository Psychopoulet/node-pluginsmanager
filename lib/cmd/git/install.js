"use strict";

// deps

	// natives
	const { join, dirname } = require("path");

	// locals
	const isDirectory = require(join(__dirname, "..", "..", "checkers", "isDirectory.js"));
	const isNonEmptyString = require(join(__dirname, "..", "..", "checkers", "isNonEmptyString.js"));
	const cmd = require(join(__dirname, "..", "cmd.js"));

// module

module.exports = function gitinstall (directory, user, repo) {

	return isNonEmptyString("cmd/git/install/directory", directory).then(() => {

		return new Promise((resolve, reject) => {

			isDirectory("cmd/git/install/directory", directory).then(() => {
				reject(new Error("\"" + directory + "\" aldready exists"));
			}).catch(() => {
				resolve();
			});

		});

	}).then(() => {
		return isNonEmptyString("cmd/git/install/user", user);
	}).then(() => {
		return isNonEmptyString("cmd/git/install/repo", repo);
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

};
