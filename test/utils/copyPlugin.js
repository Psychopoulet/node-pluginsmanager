/*
	eslint no-loop-func: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("node:path");
	const { mkdir, readdir, readFile, writeFile, cp } = require("node:fs/promises");

// module

module.exports = function copyPlugin (directory, originName, targetName, packageData = null) {

	const originDirectory = join(directory, originName);
	const targetDirectory = join(directory, targetName);

	// create dir
	return mkdir(targetDirectory, {
		"recursive": true
	}).then(() => {

		// copy dir
		return readdir(originDirectory);

	}).then((files) => {

		function _copyFiles (files) {

			return 0 >= files.length ? Promise.resolve() : Promise.resolve().then(() => {

				const file = files.shift();

				return cp(
					join(originDirectory, file),
					join(targetDirectory, file)
				);

			// loop
			}).then(() => {
				return _copyFiles(files);
			});

		}

		return _copyFiles(files);

	}).then(() => {

		return "object" === typeof packageData ? Promise.resolve().then(() => {

			const pluginPackageFile = join(targetDirectory, "package.json");

			return readFile(pluginPackageFile, "utf-8").then((content) => {
				return JSON.parse(content);
			}).then((data) => {
				return writeFile(pluginPackageFile, JSON.stringify(Object.assign(data, packageData)), "utf-8");
			});

		}).then(() => {

			return packageData.name || packageData.version ? Promise.resolve().then(() => {

				const pluginDescriptorFile = join(targetDirectory, "Descriptor.json");

				return readFile(pluginDescriptorFile, "utf-8").then((content) => {
					return JSON.parse(content);
				}).then((data) => {

					const oldTitle = data.info.title;
					const newTitle = packageData.name;

					if (packageData.name) {
						data.info.title = packageData.name;
					}

					if (packageData.version) {
						data.info.version = packageData.version;
					}

					const paths = {};
					Object.keys(data.paths).forEach((path) => {
						paths[path.replace(oldTitle, newTitle)] = data.paths[oldTitle];
					});

					data.paths = paths;

					return writeFile(pluginDescriptorFile, JSON.stringify(data), "utf-8");

				});

			}) : Promise.resolve();

		}) : Promise.resolve();

	});

};
