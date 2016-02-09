
"use strict";

// module

module.exports = class TestGoodPlugin extends require('simpleplugin') {

	constructor () {

		super();

		this.directory = __dirname;
		this.loadDataFromPackageFile();

	}

	run (data) {
		console.log("run TestGoodPlugin with '" + data + "' data");
	}

	free () {

		super.free();
		console.log('free TestGoodPlugin');

	}

}
