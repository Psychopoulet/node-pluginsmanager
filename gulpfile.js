
"use strict";

const	path = require("path"),
		gulp = require("gulp"),
		jshint = require('gulp-jshint');

gulp.task("lint-root", function() {
	return gulp.src(path.join(__dirname, '*.js')).pipe(jshint());
}).task("lint-tests-goodplugin", function() {
	return gulp.src(path.join(__dirname, 'tests', 'plugins', 'TestGoodPlugin', '*.js')).pipe(jshint());
}).task("lint-tests", ["lint-tests-goodplugin"], function() {
	return gulp.src(path.join(__dirname, 'tests', '*.js')).pipe(jshint());
}).task("lint", ["lint-root", "lint-tests"], function() {});

gulp.task("default", ["lint"], function() {
	
});
