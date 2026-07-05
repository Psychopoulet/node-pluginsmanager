// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { join } = require("node:path");
    const { cp } = require("node:fs/promises");

    // externals
    const proxyquire = require("proxyquire").noCallThru();

    // locals
    const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
    const rmdirp = require(join(__dirname, "..", "lib", "cjs", "utils", "rmdirp.js")).default;

// const

    const PLUGINS_DIRECTORY = join(__dirname, "plugins");
    const PLUGINS_DIRECTORY_MOCK = join(__dirname, "mock-plugins-repo");

    const GITHUB_USER = "Psychopoulet";
    const GITHUB_REPO = "node-pluginsmanager-plugin-test";
    const GITHUB_REPO_NOT_BUILDED = "test-good-plugin-not-builded";
    const GITHUB_WRONG_REPO = "node-containerpattern";

    const EVENTS_DATA = "test";

    const MAX_TIMOUT = 30 * 1000;

// mock (avoids real GitHub / git clone)

    function _mockGitInstall (directory, user, repo) {

        if (repo === GITHUB_WRONG_REPO) {
            return Promise.reject(new Error("Mock git clone failure"));
        }
        else if (repo === GITHUB_REPO) {
            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", GITHUB_REPO, { "name": GITHUB_REPO });
        }
        else if (repo === GITHUB_REPO_NOT_BUILDED) {

            return cp(
                join(PLUGINS_DIRECTORY_MOCK, GITHUB_REPO_NOT_BUILDED),
                join(PLUGINS_DIRECTORY, GITHUB_REPO_NOT_BUILDED),
                { "recursive": true }
            );

        }

        return Promise.reject(new Error("Unexpected repo in mock: " + repo));

    }

    const PluginsManager = proxyquire(join(__dirname, "..", "lib", "cjs", "PluginsManager.js"), {
        "./cmd/git/gitInstall": {
            "__esModule": true,
            "default": _mockGitInstall
        }
    }).default;

// tests

describe("pluginsmanager / install via github", () => {

    const pluginsManager = new PluginsManager({
        "directory": PLUGINS_DIRECTORY
    });

    before(() => {
        return pluginsManager.loadAll();
    });

    after(() => {

        return pluginsManager.releaseAll().then(() => {
            return pluginsManager.destroyAll();
        }).then(() => {
            return rmdirp(join(PLUGINS_DIRECTORY, GITHUB_WRONG_REPO));
        }).then(() => {
            return rmdirp(join(PLUGINS_DIRECTORY, GITHUB_REPO));
        }).then(() => {
            return rmdirp(join(PLUGINS_DIRECTORY, GITHUB_REPO_NOT_BUILDED));
        });

    });

    describe("params", () => {

        describe("user", () => {

            it("should test update without user", (done) => {

                pluginsManager.installViaGithub().then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof ReferenceError, "Generated error is not an instance of Error");

                    done();

                });

            });

            it("should test update with wrong user", (done) => {

                pluginsManager.installViaGithub(false).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof TypeError, "Generated error is not an instance of Error");

                    done();

                });

            });

            it("should test update with empty user", (done) => {

                pluginsManager.installViaGithub("").then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof RangeError, "Generated error is not an instance of Error");

                    done();

                });

            });

        });

        describe("repo", () => {

            it("should test update without repo", (done) => {

                pluginsManager.installViaGithub(GITHUB_USER).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof ReferenceError, "Generated error is not an instance of Error");

                    done();

                });

            });

            it("should test update with wrong repo", (done) => {

                pluginsManager.installViaGithub(GITHUB_USER, false).then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof TypeError, "Generated error is not an instance of Error");

                    done();

                });

            });

            it("should test update with empty repo", (done) => {

                pluginsManager.installViaGithub(GITHUB_USER, "").then(() => {
                    done(new Error("tests does not generate error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof RangeError, "Generated error is not an instance of Error");

                    done();

                });

            });

        });

    });

    describe("execute", () => {

        it("should test download with wrong repo", (done) => {

            pluginsManager.installViaGithub(GITHUB_USER, GITHUB_WRONG_REPO).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");

                done();

            });

        });

        it("should test download with valid repo", () => {

            pluginsManager.on("installed", (plugin, data) => {

                strictEqual(typeof data, "string", "Events data is not a string");
                strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                (0, console).log("--- [PluginsManager/events/installed] '" + plugin.name + "' - " + data);

            });

            const pluginsCountBeforeInstall = pluginsManager.plugins.length;

            return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO, EVENTS_DATA).then((plugin) => {

                strictEqual(typeof plugin, "object", "Plugin is not an object");
                strictEqual(typeof plugin.name, "string", "Plugin name is not a string");
                strictEqual(plugin.name, GITHUB_REPO, "Plugin name is not as expected");

                strictEqual(pluginsManager.plugins.length, pluginsCountBeforeInstall + 1, "Installed plugin is not registered");
                ok(pluginsManager.getPluginsNames().includes(GITHUB_REPO), "Installed plugin name is not registered");
                strictEqual(
                    pluginsManager.plugins.find((p) => {
                        return GITHUB_REPO === p.name;
                    }), plugin, "Installed plugin is not in plugins list"
                );

            });

        });

        it("should test download already existing repo", (done) => {

            pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not as expected");
                ok(err instanceof Error, "Generated error is not as expected");

                done();

            });

        });

        it("should test download with valid not builded repo", () => {

            pluginsManager.on("installed", (plugin, data) => {

                strictEqual(typeof data, "string", "Events data is not a string");
                strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                (0, console).log("--- [PluginsManager/events/installed] '" + plugin.name + "' - " + data);

            });

            const pluginsCountBeforeInstall = pluginsManager.plugins.length;

            return pluginsManager.installViaGithub(GITHUB_USER, GITHUB_REPO_NOT_BUILDED, EVENTS_DATA).then((plugin) => {

                strictEqual(typeof plugin, "object", "Plugin is not an object");
                strictEqual(typeof plugin.name, "string", "Plugin name is not a string");
                strictEqual(plugin.name, GITHUB_REPO_NOT_BUILDED, "Plugin name is not as expected");

                strictEqual(
                    pluginsManager.plugins.length, pluginsCountBeforeInstall + 1, "Installed plugin is not registered"
                );
                ok(
                    pluginsManager.getPluginsNames().includes(GITHUB_REPO_NOT_BUILDED),
                    "Installed plugin name is not registered"
                );
                strictEqual(
                    pluginsManager.plugins.find((p) => {
                        return GITHUB_REPO_NOT_BUILDED === p.name;
                    }),
                    plugin,
                    "Installed plugin is not in plugins list"
                );

            });

        }).timeout(MAX_TIMOUT);

    });

});
