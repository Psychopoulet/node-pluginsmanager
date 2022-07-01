"use strict";

// deps

	// natives
	import { spawn } from "child_process";

	// locals
	import checkDirectory from "../checkers/checkDirectory";
	import checkNonEmptyArray from "../checkers/checkNonEmptyArray";
	import checkNonEmptyString from "../checkers/checkNonEmptyString";
	import stdToString from "./stdToString";

// types & interfaces

	import { ChildProcessWithoutNullStreams } from "child_process";

// module

export default function cmd (directory: string, command: string, params: Array<string>): Promise<void> {

	return checkDirectory("cmd/directory", directory).then((): Promise<void> => {
		return checkNonEmptyString("cmd/command", command);
	}).then((): Promise<void> => {
		return checkNonEmptyArray("cmd/params", params);
	}).then((): Promise<void> => {

		return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

			let result: string = "";
			const mySpawn: ChildProcessWithoutNullStreams = spawn(command, params, {
				"cwd": directory
			}).on("error", (err: Error): void => {
				result += stdToString(err);
			}).on("close", (code: number): void => {
				return code ? reject(new Error(result)) : resolve();
			});

			mySpawn.stderr.on("data", (msg: any): void => {
				result += stdToString(msg);
			});

		});

	});

};
