"use strict";

// deps

	// locals
	import npmCmd from "./npmCmd";

// module

export default function npmInstall (directory: string): Promise<void> {
	return npmCmd(directory, [ "install", "--prod" ]);
};
