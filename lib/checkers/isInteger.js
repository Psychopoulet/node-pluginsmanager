"use strict";

// module

module.exports = function isInteger (dataName, data) {

	if ("undefined" === typeof data) {
		return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
	}
	else if ("number" !== typeof data || !Number.isInteger(data)) {
		return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an integer"));
	}
	else {
		return Promise.resolve();
	}

};
