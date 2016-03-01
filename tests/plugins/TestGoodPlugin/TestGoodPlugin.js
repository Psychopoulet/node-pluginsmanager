
"use strict";

module.exports = class TestGoodPlugin extends require('../../../main.js').SimplePlugin {

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
