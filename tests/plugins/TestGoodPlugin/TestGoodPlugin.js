
"use strict";

var cn = console;

module.exports = class TestGoodPlugin extends require(require("path").join("..", "..", "..", "lib", "main.js")).plugin {

	// load

	load (data) {

		cn.log("load TestGoodPlugin with \"" + data + "\" data");
		return Promise.resolve();

	}

	unload (data) {

		super.unload();

		cn.log("unload TestGoodPlugin with \"" + data + "\" data");
		return Promise.resolve();

	}

	// write

	install (data) {

		cn.log("install TestGoodPlugin with \"" + data + "\" data");
		return Promise.resolve();

	}

	update (data) {
		
		cn.log("update TestGoodPlugin with \"" + data + "\" data");
		return Promise.resolve();

	}

	uninstall (data) {
		
		cn.log("install TestGoodPlugin with \"" + data + "\" data");
		return Promise.resolve();

	}

};
