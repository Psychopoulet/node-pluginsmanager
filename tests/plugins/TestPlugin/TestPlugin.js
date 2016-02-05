
"use strict";

// module

module.exports = class TestPlugin extends require('simpleplugin') {

	constructor () {

		super();

		this.directory = __dirname;
		this.loadDataFromPackageFile();

	}

	run (data) {
		console.log("run TestPlugin with '" + data + "' data");
	}

	free () {

		super.free();
		console.log('free TestPlugin');

	}

}
