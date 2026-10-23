// deps

    // natives
    const { strictEqual } = require("node:assert");
    const { execFile } = require("node:child_process");
    const { mkdir, mkdtemp, rm, writeFile } = require("node:fs/promises");
    const { tmpdir } = require("node:os");
    const { join } = require("node:path");

    // locals
    const isGitUsed = require(join(__dirname, "..", "lib", "src", "cmd", "isGitUsed.ts")).default;

// private

    function _git (cwd, args) {

        return new Promise((resolve, reject) => {

            execFile("git", args, {
                "cwd": cwd
            }, (err) => {
                return err ? reject(err) : resolve();
            });

        });

    }

// tests

describe("cmd / isGitUsed", () => {

    it("should return false when the directory has no git metadata", () => {

        return mkdtemp(join(tmpdir(), "pluginsmanager-nogit-")).then((dir) => {

            return isGitUsed(dir).then((used) => {
                strictEqual(used, false);
            }).finally(() => {

                return rm(dir, {
                    "recursive": true,
                    "force": true
                });

            });

        });

    });

    it("should return false when git metadata has no commit", () => {

        return mkdtemp(join(tmpdir(), "pluginsmanager-emptygit-")).then((dir) => {

            return mkdir(join(dir, ".git")).then(() => {
                return isGitUsed(dir);
            }).then((used) => {
                strictEqual(used, false);
            }).finally(() => {

                return rm(dir, {
                    "recursive": true,
                    "force": true
                });

            });

        });

    });

    it("should return true for a git repository with a commit", () => {

        return mkdtemp(join(tmpdir(), "pluginsmanager-git-")).then((dir) => {

            return _git(dir, [ "init" ]).then(() => {
                return writeFile(join(dir, "file.txt"), "a", "utf-8");
            }).then(() => {
                return _git(dir, [
                    "-c",
                    "user.email=test@example.com",
                    "-c",
                    "user.name=test",
                    "add",
                    "file.txt"
                ]);
            }).then(() => {
                return _git(dir, [
                    "-c",
                    "user.email=test@example.com",
                    "-c",
                    "user.name=test",
                    "commit",
                    "-m",
                    "init"
                ]);
            }).then(() => {
                return isGitUsed(dir);
            }).then((used) => {
                strictEqual(used, true);
            }).finally(() => {

                return rm(dir, {
                    "recursive": true,
                    "force": true
                });

            });

        });

    });

});
