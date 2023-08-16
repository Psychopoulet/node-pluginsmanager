"use strict";

// deps

	// natives
	import EventEmitter from "node:events";

	// locals
	import checkFunction from "./checkFunction";

// module

export default function checkOrchestrator (dataName: string, data: any): Promise<void> {

	if ("undefined" === typeof data) {
		return Promise.reject(new ReferenceError("\"" + dataName + "\" parameter is missing"));
	}
		else if ("object" !== typeof data || !(data instanceof EventEmitter)) {
			return Promise.reject(new TypeError("\"" + dataName + "\" parameter is not an Event"));
		}

	else {

		return checkFunction("isOrchestrator/load", (data as any).load).then((): Promise<void> => {
			return checkFunction("isOrchestrator/destroy", (data as any).destroy);
		}).then((): Promise<void> => {
			return checkFunction("isOrchestrator/init", (data as any).init);
		}).then((): Promise<void> => {
			return checkFunction("isOrchestrator/release", (data as any).release);
		}).then((): Promise<void> => {
			return checkFunction("isOrchestrator/install", (data as any).install);
		}).then((): Promise<void> => {
			return checkFunction("isOrchestrator/update", (data as any).update);
		}).then((): Promise<void> => {
			return checkFunction("isOrchestrator/uninstall", (data as any).uninstall);
		});

	}

};
