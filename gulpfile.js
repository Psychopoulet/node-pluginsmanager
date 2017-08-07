
"use strict";

// deps

	const path = require("path");

	// gulp
	const gulp = require("gulp");
	const plumber = require("gulp-plumber");

	// tests
	const eslint = require("gulp-eslint");
	const mocha = require("gulp-mocha");
	const istanbul = require("gulp-istanbul");

// consts

	const UNITTESTSFILES = path.join(__dirname, "tests", "*.js");

	const TOTESTFILES = [
		path.join(__dirname, "gulpfile.js"),
		path.join(__dirname, "lib", "**", "*.js"),
		UNITTESTSFILES
	];

// tasks

	gulp.task("eslint", () => {

		return gulp.src(UNITTESTSFILES)
			.pipe(plumber())
			.pipe(eslint({
				"env": require(path.join(__dirname, "gulpfile", "eslint", "env.json")),
				"globals": require(path.join(__dirname, "gulpfile", "eslint", "globals.json")),
				"parserOptions": {
					"ecmaVersion": 6
				},
				// http://eslint.org/docs/rules/
				"rules": require(path.join(__dirname, "gulpfile", "eslint", "rules.json"))
			}))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());

	});

	gulp.task("istanbul", [ "eslint" ], () => {

		return gulp.src(TOTESTFILES)
			.pipe(istanbul())
			.pipe(istanbul.hookRequire());

	});

	gulp.task("mocha", ["eslint"], () => {

		return gulp.src(UNITTESTSFILES)
			.pipe(plumber())
			.pipe(mocha())
			.pipe(istanbul.writeReports());

	});

// watcher

	gulp.task("watch", () => {
		gulp.watch(_toTestFiles, ["mocha"]);
	});


// default

	gulp.task("default", ["mocha"]);
	