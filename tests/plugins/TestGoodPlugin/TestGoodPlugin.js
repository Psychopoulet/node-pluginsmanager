
"use strict";

module.exports = class TestGoodPlugin extends require('../../../main.js').SimplePlugin {

	// load

	load (data) {

		return new Promise(function(resolve, reject) {

			console.log("load TestGoodPlugin with '" + data + "' data");
			resolve();

		});

	}

	unload (data) {

		super.unload();

		return new Promise(function(resolve, reject) {

			console.log("unload TestGoodPlugin with '" + data + "' data");
			resolve();

		});

	}

	// write

	install (data) {

		return new Promise(function(resolve, reject) {

			console.log("install TestGoodPlugin with '" + data + "' data");
			resolve();

		});

	}

	update (data) {
		
		return new Promise(function(resolve, reject) {

			console.log("update TestGoodPlugin with '" + data + "' data");
			resolve();

		});

	}

	uninstall (data) {
		
		return new Promise(function(resolve, reject) {

			console.log("install TestGoodPlugin with '" + data + "' data");
			resolve();

		});

	}

}
