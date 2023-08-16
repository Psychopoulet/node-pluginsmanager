
"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { rm } = require("node:fs/promises");

// exec

rm(join(__dirname, "lib"), {
	"recursive": true
}).then(() => {

	process.exitCode = 0;
	process.exit(0);

}).catch((err) => {

	(0, console).error(err);

	process.exitCode = 1;
	process.exit(1);

});
