
"use strict";

// deps

	// natives
	const { exec } = require("child_process");
	const { join } = require("path");
	const { unlink } = require("fs");

// consts

	const MAX_TIMEOUT = 10000;

// tests

describe("compilation typescript", () => {

	describe("commonjs", () => {

		after((done) => {

			unlink(join(__dirname, "typescript", "compilation.cjs"), (err) => {
				return err ? done(err) : done();
			});

		});

		it("should compile typescript file", () => {

			return new Promise((resolve, reject) => {

				const args = [
					"npx tsc",
					join(__dirname, "typescript", "compilation.cts"),
					"--target es6",
					"--module commonjs",
					"--esModuleInterop"
				];

				exec(args.join(" "), {
					"cwd": join(__dirname, ".."),
					"windowsHide": true
				}, (err) => {
					return err ? reject(err) : resolve();
				});

			});

		}).timeout(MAX_TIMEOUT);

		it("should exec compiled typescript file", (done) => {

			const args = [
				"node",
				join(__dirname, "typescript", "compilation.cjs")
			];

			exec(args.join(" "), {
				"cwd": join(__dirname, ".."),
				"windowsHide": true
			}, (err) => {
				return err ? done(err) : done();
			});

		});

	});

});
