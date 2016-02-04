
"use strict";

// module

module.exports = class TestPlugin extends require('simpleplugin') {

	constructor () {

		super();

		this.directory = __dirname;
		this.loadDataFromPackageFile();

	}

	run () {
		console.log('run TestPlugin');
	}

	free () {

		super.free();
		console.log('free TestPlugin');

	}

}
