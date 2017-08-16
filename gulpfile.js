
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

	const APP_FILES = [ path.join(__dirname, "lib", "**", "*.js") ];
	const UNITTESTS_FILES = [ path.join(__dirname, "tests", "*.js") ];

	const ALL_FILES = [ path.join(__dirname, "gulpfile.js") ].concat(APP_FILES).concat(UNITTESTS_FILES);

// tasks

	gulp.task("eslint", () => {

		return gulp.src(ALL_FILES)
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

		return gulp.src(APP_FILES)
			.pipe(istanbul())
			.pipe(istanbul.hookRequire());

	});

	gulp.task("mocha", [ "eslint" ], () => {

		return gulp.src(UNITTESTS_FILES)
			.pipe(plumber())
			.pipe(mocha())
			.pipe(istanbul.writeReports())
			.pipe(istanbul.enforceThresholds({ "thresholds": { "global": 85 } }));

	});

// watcher

	gulp.task("watch", () => {
		gulp.watch(ALL_FILES, [ "mocha" ]);
	});


// default

	gulp.task("default", [ "mocha" ]);
