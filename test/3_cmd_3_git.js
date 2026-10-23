// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { execFile } = require("node:child_process");
    const { mkdir, mkdtemp, rm, writeFile } = require("node:fs/promises");
    const { homedir, tmpdir } = require("node:os");
    const { join } = require("node:path");

    // locals

    const GIT_DIRECTORY = join(__dirname, "..", "lib", "src", "cmd", "git");

        const install = require(join(GIT_DIRECTORY, "gitInstall.ts"));
        const update = require(join(GIT_DIRECTORY, "gitUpdate.ts"));

// const

    const MAX_TIMOUT = 30 * 1000;

    const GITHUB_USER = "Psychopoulet";
    const GITHUB_PACKAGE = "node-containerpattern";

    const PLUGINS_DIRECTORY = join(homedir(), "node-pluginsmanager");
        const DOWNLOADED_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "node-containerpattern");

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

describe("cmd / git", () => {

    before(() => {

        return mkdir(PLUGINS_DIRECTORY, {
            "recursive": true
        });

    });

    after(() => {

        return rm(PLUGINS_DIRECTORY, {
            "recursive": true
        });

    });

    describe("install", () => {

        describe("missing data", () => {

            it("should test with missing directory", (done) => {

                install.default().then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof ReferenceError, "generated error is not as expected");

                    done();

                });

            });

            it("should test with missing user", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof ReferenceError, "generated error is not as expected");

                    done();

                });

            });

            it("should test with missing repo", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof ReferenceError, "generated error is not as expected");

                    done();

                });

            });

        });

        describe("wrong data", () => {

            it("should test with wrong directory", (done) => {

                install.default(false).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof TypeError, "generated error is not as expected");

                    done();

                });

            });

            it("should test with wrong user", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, false).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof TypeError, "generated error is not as expected");

                    done();

                });

            });

            it("should test with wrong repo", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, false).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof TypeError, "generated error is not as expected");

                    done();

                });

            });

        });

        describe("empty data", () => {

            it("should test with empty data", (done) => {

                install.default("").then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof Error, "generated error is not as expected");

                    done();

                });

            });

            it("should test with empty user", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, "").then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof Error, "generated error is not as expected");

                    done();

                });

            });

            it("should test with empty repo", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, "").then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof Error, "generated error is not as expected");

                    done();

                });

            });

        });

        describe("valid", () => {

            it("should test with valid data", () => {
                return install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, GITHUB_PACKAGE);
            }).timeout(MAX_TIMOUT);

            it("should test with already existing directory", (done) => {

                install.default(DOWNLOADED_PLUGIN_DIRECTORY, GITHUB_USER, GITHUB_PACKAGE).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "generated error is not as expected");
                    ok(err instanceof Error, "generated error is not as expected");

                    done();

                });

            });

        });

    });

    describe("update", () => {

        it("should test with missing data", (done) => {

            update.default().then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof ReferenceError, "generated error is not as expected");

                done();

            });

        });

        it("should test with wrong data", (done) => {

            update.default(false).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof TypeError, "generated error is not as expected");

                done();

            });

        });

        it("should test with empty data", (done) => {

            update.default("").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

                done();

            });

        });

        it("should test with not existing directory", (done) => {

            update.default(DOWNLOADED_PLUGIN_DIRECTORY + "test", GITHUB_USER, GITHUB_PACKAGE).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

                done();

            });

        });

        it("should test with valid data", () => {
            return update.default(DOWNLOADED_PLUGIN_DIRECTORY);
        }).timeout(MAX_TIMOUT);

        it("should reject an empty tag", (done) => {

            update.default(DOWNLOADED_PLUGIN_DIRECTORY, "").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

                done();

            });

        });

        it("should checkout a specific tag", () => {

            let root = "";

            return mkdtemp(join(tmpdir(), "pluginsmanager-git-tag-")).then((dir) => {

                root = dir;

                return mkdir(join(dir, "origin"));

            }).then(() => {

                const origin = join(root, "origin");

                return _git(origin, [ "init" ]).then(() => {
                    return writeFile(join(origin, "file.txt"), "a", "utf-8");
                }).then(() => {
                    return _git(origin, [
                        "-c",
                        "user.email=test@example.com",
                        "-c",
                        "user.name=test",
                        "add",
                        "file.txt"
                    ]);
                }).then(() => {
                    return _git(origin, [
                        "-c",
                        "user.email=test@example.com",
                        "-c",
                        "user.name=test",
                        "commit",
                        "-m",
                        "init"
                    ]);
                }).then(() => {
                    return _git(origin, [ "tag", "v1.0.0" ]);
                }).then(() => {
                    return _git(root, [
                        "clone",
                        origin,
                        "clone"
                    ]);
                }).then(() => {
                    return update.default(join(root, "clone"), "v1.0.0");
                });

            }).finally(() => {

                return root ? rm(root, {
                    "recursive": true,
                    "force": true
                }) : Promise.resolve();

            });

        }).timeout(MAX_TIMOUT);

    });

});
