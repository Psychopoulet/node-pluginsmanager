/*
	eslint no-loop-func: 0
*/

"use strict";

// deps

	// natives
	const { join } = require("path");

	// externals
	const {
		mkdirProm,
		readdirProm, copyFileProm,
		readJSONFileProm, writeJSONFileProm
	} = require("node-promfs");

// module

module.exports = function copyPlugin (directory, originName, targetName, packageData = null) {

	const originDirectory = join(directory, originName);
	const targetDirectory = join(directory, targetName);

	// create dir
	return mkdirProm(targetDirectory).then(() => {

		// copy dir
		return readdirProm(originDirectory).then((files) => {

			return new Promise((resolve, reject) => {

				let j = 0;

				for (let i = 0; i < files.length; ++i) {

					copyFileProm(
						join(originDirectory, files[i]),
						join(targetDirectory, files[i])
					).then(() => {

						if (-1 < j) {

							++j;

							if (j === files.length) {
								resolve();
							}

						}

					}).catch((err) => {
						j = -1;
						reject(err);
					});

				}

			});

		});

	}).then(() => {

		return "object" === typeof packageData ? Promise.resolve().then(() => {

			const pluginPackageFile = join(targetDirectory, "package.json");

			return readJSONFileProm(pluginPackageFile).then((data) => {
				return writeJSONFileProm(pluginPackageFile, Object.assign(data, packageData));
			});

		}).then(() => {

			return packageData.name || packageData.version ? Promise.resolve().then(() => {

				const pluginDescriptorFile = join(targetDirectory, "Descriptor.json");

				return readJSONFileProm(pluginDescriptorFile).then((data) => {

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

					return writeJSONFileProm(pluginDescriptorFile, data);

				});

			}) : Promise.resolve();

		}) : Promise.resolve();

	});

};
