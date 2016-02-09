
"use strict";

const 	path = require('path'),
		fs = require('simplefs'),
		SimplePluginsManager = require('../main.js');

try {

	var oPluginsManager = new SimplePluginsManager();

	console.log("----------------");
	console.log("test error");
	console.log("----------------");
	console.log("must be == 'SimplePluginsManager/loadAll : 'directory' is not defined.' :");

	oPluginsManager

		.on('error', function(msg) {
			console.log("--- [event/error] '" + msg + "' ---");
		})
		.on('add', function(pluginPath) {
			console.log("--- [event/add] '" + pluginPath + "' added ---");
		})
		.on('remove', function(pluginName) {
			console.log("--- [event/remove] '" + pluginName + "' removed ---");
		})
		.on('load', function(plugin) {
			console.log("--- [event/load] '" + plugin.name + "' loaded ---");
		})

	.loadAll().then(function() {

		console.log('plugins loaded');

		console.log("----------------");
		console.log("");

	})
	.catch(function(err) {

		console.log(err);

		console.log("must be == 'SimplePluginsManager/addByGithub : '' is not a valid github url.' :");
		oPluginsManager.addByGithub('').then(function() {

			console.log('added');

			console.log("----------------");
			console.log("");

		}).catch(function(msg) {

			console.log(msg);

			console.log("----------------");
			console.log("");

			oPluginsManager.directory = path.join(__dirname, 'plugins');

			console.log("----------------");
			console.log("test SimplePluginsManager");
			console.log("----------------");
			console.log("must be == 'run TestGoodPlugin with 'test' data' :");

			oPluginsManager.loadAll('test').then(function() {

				console.log("must be == [ 'TestEmptyPlugin', 'TestGoodPlugin' ] :");
				console.log(oPluginsManager.getPluginsNames());

				console.log("must be == 'SimplePluginsManager/loadOne : '<path>' is not a valid plugin.' :");
				oPluginsManager.addByGithub('https://github.com/Psychopoulet/simplefs').then(function() {
					
					console.log('added');

					console.log("----------------");
					console.log("");

				}).catch(function(msg) {

					console.log(msg);

					console.log("must be == [ 'TestEmptyPlugin', 'TestGoodPlugin', 'simplefs' ] :");
					console.log(oPluginsManager.getPluginsNames());

					if (3 == oPluginsManager.plugins.length) {

						oPluginsManager.removeByDirectory(path.join(oPluginsManager.directory, 'simplefs')).then(function () {

							console.log("must be == [ 'TestEmptyPlugin', 'TestGoodPlugin' ] :");
							console.log(oPluginsManager.getPluginsNames());

							console.log("----------------");
							console.log("");

						})
						.catch(function(msg) {

							console.log(msg);

							console.log("----------------");
							console.log("");

						});

					}

				});

			})
			.catch(function(err) {

				console.log('plugins load failed : ' + err);

				console.log("----------------");
				console.log("");

			});

		});

	});

}
catch(e) {
	console.log(e);
}
