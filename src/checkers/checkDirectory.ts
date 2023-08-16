"use strict";

// deps

	// natives
	import { lstat, Stats } from "node:fs";

	// locals
	import checkNonEmptyString from "./checkNonEmptyString";

// module

export default function checkDirectory (dataName: string, directory: string): Promise<void> {

	return checkNonEmptyString(dataName, directory).then((): Promise<boolean> => {

		return new Promise((resolve: (exists: boolean) => void): void => {

			lstat(directory, (err: Error | null, stats: Stats): void => {
				return resolve(Boolean(!err && stats.isDirectory()));
			});

		});

	}).then((exists: boolean): Promise<void> => {

		return exists ? Promise.resolve() : Promise.reject(new Error(
			"\"" + dataName + "\" (" + directory + ") is not a valid directory"
		));

	});

};
