
"use strict";

const SimplePluginsManager = require('../main.js');

try {

	var oPluginsManager = new SimplePluginsManager();

	console.log("----------------");
	console.log("test error");
	console.log("----------------");
	console.log("must be == 'SimplePluginsManager/load : 'directory' is not defined.' :");

	oPluginsManager.load()
	.then(function() {

		console.log('all plugins loaded');

		console.log("----------------");
		console.log("");

	})
	.catch(function(err) {

		console.log(err);

		console.log("----------------");
		console.log("");

		oPluginsManager.directory = require('path').join(__dirname, 'plugins');

		console.log("----------------");
		console.log("test SimplePluginsManager");
		console.log("----------------");
		console.log("must be == 'run TestPlugin' :");

		oPluginsManager.load().then(function() {

			console.log("must be == [ 'TestPlugin', 'TestPlugin2' ] :");
			console.log(oPluginsManager.getPluginsNames());

			console.log("----------------");
			console.log("");

		})
		.catch(function(err) {

			console.log('plugins load failed : ' + err);

			console.log("----------------");
			console.log("");

		});

	});

}
catch(e) {
	console.log(e);
}
