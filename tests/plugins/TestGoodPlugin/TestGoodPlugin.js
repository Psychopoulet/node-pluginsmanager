
"use strict";

module.exports = class TestGoodPlugin extends require('../../../main.js').SimplePlugin {

	// load

	load (data) {
		console.log("load TestGoodPlugin with '" + data + "' data");
	}

	unload (data) {

		super.unload();
		console.log("unload TestGoodPlugin with '" + data + "' data");

	}

	// write

	install (data) {
		console.log("install TestGoodPlugin with '" + data + "' data");
	}

	update (data) {
		console.log("update TestGoodPlugin with '" + data + "' data");
	}

	uninstall (data) {
		console.log("install TestGoodPlugin with '" + data + "' data");
	}

}
