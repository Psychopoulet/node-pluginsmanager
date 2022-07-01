"use strict";

// module

export default function isNonEmptyArray (dataName: string, data: any): Promise<void> {

	if ("undefined" === typeof data) {
		return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
	}
		else if ("object" !== typeof data || !(data instanceof Array)) {
			return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Array"));
		}
		else if (!data.length) {
			return Promise.reject(new RangeError("\"" + dataName + "\" parameter is empty"));
		}

	else {
		return Promise.resolve();
	}

};
