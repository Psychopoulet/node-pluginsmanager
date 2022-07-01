"use strict";

// deps

	// natives
	import { isAbsolute } from "path";

	// locals
	import checkDirectory from "./checkDirectory";

// module

export default function checkAbsoluteDirectory (dataName: string, directory: string): Promise<void> {

	return checkDirectory(dataName, directory).then((): Promise<void> => {

		return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

			return isAbsolute(directory) ? resolve() : reject(new Error(
				"\"" + dataName + "\" (" + directory + ") is not an absolute path"
			));

		});

	});

};
