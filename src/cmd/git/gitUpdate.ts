"use strict";

// deps

	// locals
	import checkDirectory from "../../checkers/checkDirectory";
	import cmd from "../cmd";

// module

export default function gitUpdate (directory: string): Promise<void> {

	return checkDirectory("cmd/git/update/directory", directory).then((): Promise<void> => {

		// git update
		return cmd(directory, "git", [ "pull" ]);

	});

};
