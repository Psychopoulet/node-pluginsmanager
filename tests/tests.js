
"use strict";

const 	path = require('path'),
		fs = require('simplefs'),
		SimplePluginsManager = require('../main.js');

try {

	var oPluginsManager = new SimplePluginsManager();

	console.log("----------------");
	console.log("test errors");
	console.log("----------------");
	console.log("must be == 'SimplePluginsManager/loadAll : '<path>' does not exist.' :");

	oPluginsManager

		.on('error', function(msg) {
			console.log("--- [event/error] '" + msg + "' ---");
		})
		.on('add', function(plugin) {
        	console.log("--- [event/add] '" + plugin.name + "' (v" + plugin.version + ") added ---");
		})
		.on('update', function(plugin) {
			console.log("--- [event/update] '" + plugin.name + "' (v" + plugin.version + ") updated ---");
		})
		.on('remove', function(pluginName) {
			console.log("--- [event/remove] '" + pluginName + "' removed ---");
		})
		.on('load', function(plugin) {
			console.log("--- [event/load] '" + plugin.name + "' (v" + plugin.version + ") loaded ---");
		})

	.loadAll().then(function() {

		console.log('plugins loaded');

		console.log("----------------");
		console.log("");

	})
	.catch(function(err) {

		console.log(err);

		oPluginsManager.directory = path.join(__dirname, 'plugins');

		var sEmptyPlugin = path.join(oPluginsManager.directory, 'TestEmptyPlugin');

		fs.mkdirp(sEmptyPlugin);

		console.log("must be == 'SimplePluginsManager/loadOne : missing '<path>package.json' file.' :");
		oPluginsManager.loadOne(sEmptyPlugin).then(function() {
			console.log('loaded');
		})
		.catch(function(err) {

			console.log(err);

			oPluginsManager.removeByDirectory(sEmptyPlugin).then(function () {

				console.log("must be == 'SimplePluginsManager/addByGithub : '' is not a valid github url.' :");
				oPluginsManager.addByGithub('').then(function() {

					console.log('added');

					console.log("----------------");
					console.log("");

				}).catch(function(err) {

					console.log(err);

					console.log("must be == 'SimplePluginsManager/loadOne : '<path>' has no 'run' method.' :");
					oPluginsManager.addByGithub('https://github.com/Psychopoulet/simplecontainer').then(function() {
						
						console.log('simplecontainer added');

						console.log("----------------");
						console.log("");

					}).catch(function(err) {

						console.log(err);

						oPluginsManager.removeByDirectory(path.join(oPluginsManager.directory, 'simplecontainer')).then(function () {

							console.log("must be == 'SimplePluginsManager/loadOne : missing '<path>package.json' file.' :");
							oPluginsManager.addByGithub('https://github.com/Psychopoulet/angular-bootstrap-popup').then(function() {
								
								console.log('angular-bootstrap-popup added');

								console.log("----------------");
								console.log("");

							}).catch(function(err) {

								console.log(err);

								oPluginsManager.removeByDirectory(path.join(oPluginsManager.directory, 'angular-bootstrap-popup')).then(function () {

									console.log("must be == 'SimplePluginsManager/loadOne : '<path>' is not a valid plugin.' :");
									oPluginsManager.addByGithub('https://github.com/Psychopoulet/simplefs').then(function() {
										
										console.log('simplefs added');

										console.log("----------------");
										console.log("");

									}).catch(function(err) {

										console.log(err);

										oPluginsManager.updateByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function (plugin) {

											console.log("'" + plugin.name +  "' updated");

											console.log("----------------");
											console.log("");

										})
										.catch(function(err) {
											
											oPluginsManager.removeByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function () {

												console.log("must be == [] :");
												console.log(oPluginsManager.plugins);

												console.log("----------------");
												console.log("");

											})
											.catch(function(err) {

												console.log(err);

												console.log("----------------");
												console.log("");

											});

										});

									});

								})
								.catch(function(err) {

									console.log(err);

									console.log("----------------");
									console.log("");

								});

							});

						})
						.catch(function(err) {

							console.log(err);

							console.log("----------------");
							console.log("");

						});

					});

				});

			})
			.catch(function(err) {

				console.log(err);

				console.log("----------------");
				console.log("");

			});

		});

	});

}
catch(e) {
	console.log(e);
}
