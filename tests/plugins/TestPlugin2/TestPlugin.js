
"use strict";

// module

module.exports = class TestPlugin extends require('simpleplugin') {

	constructor () {

		super();

		this.directory = __dirname;
		this.loadDataFromPackageFile();

	}

	run () { }
	free () { super.free(); }

}
