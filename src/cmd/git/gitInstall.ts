"use strict";

// deps

	// natives
	import { dirname } from "path";

	// locals
	import checkDirectory from "../../checkers/checkDirectory";
	import checkNonEmptyString from "../../checkers/checkNonEmptyString";
	import cmd from "../cmd";

// module

export default function gitInstall (directory: string, user: string, repo: string): Promise<void> {

	return checkNonEmptyString("cmd/git/install/directory", directory).then((): Promise<void> => {

		return new Promise((resolve: () => void, reject: (err: Error) => void) => {

			checkDirectory("cmd/git/install/directory", directory).then((): void => {
				reject(new Error("\"" + directory + "\" aldready exists"));
			}).catch((): void => {
				resolve();
			});

		});

	}).then((): Promise<void> => {
		return checkNonEmptyString("cmd/git/install/user", user);
	}).then((): Promise<void> => {
		return checkNonEmptyString("cmd/git/install/repo", repo);
	}).then((): Promise<void> => {

		// git clone
		return cmd(dirname(directory), "git", [
			"-c",
			"core.quotepath=false",
			"clone",
			"--recursive",
			"--depth",
			"1",
			"https://github.com/" + user + "/" + repo + "/",
			directory
		]);

	});

};
