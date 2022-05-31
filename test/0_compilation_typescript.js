
"use strict";

// deps

	// natives
	const { exec } = require("child_process");
	const { join } = require("path");
	const { unlink, readFile, writeFile } = require("fs");

// consts

	const MAX_TIMEOUT = 10000;

// tests

describe("compilation typescript", () => {

	after((done) => {

		unlink(join(__dirname, "typescript", "compilation.js"), (err) => {
			return err ? done(err) : done();
		});

	});

	it("should compile typescript file", () => {

		return new Promise((resolve, reject) => {

			const args = [
				"npx tsc", // executer
				join(__dirname, "typescript", "compilation.ts"),
				"--target es6",
				"--module CommonJS",
				"--downlevelIteration" // specific for this package
			];

			exec(args.join(" "), {
				"cwd": join(__dirname, ".."),
				"windowsHide": true
			}, (err) => {
				return err ? reject(err) : resolve();
			});

		}).then(() => {

			return new Promise((resolve, reject) => {

				readFile(join(__dirname, "typescript", "compilation.js"), "utf-8", (err, content) => {
					return err ? reject(err) : resolve(content);
				});

			});

		}).then((content) => {

			return new Promise((resolve, reject) => {

				const { name } = require(join(__dirname, "..", "package.json"));

				writeFile(join(__dirname, "typescript", "compilation.js"), content.replace(name, "../../lib/main.js"), "utf-8", (err) => {
					return err ? reject(err) : resolve();
				});

			});

		});

	}).timeout(MAX_TIMEOUT);

	it("should exec compiled typescript file", (done) => {

		const args = [
			"node", // executer
			join(__dirname, "typescript", "compilation.js")
		];

		exec(args.join(" "), {
			"cwd": join(__dirname, ".."),
			"windowsHide": true
		}, (err) => {
			return err ? done(err) : done();
		});

	});

});
