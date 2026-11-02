// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { basename, isAbsolute, join, relative } = require("node:path");

    // externals
    const proxyquire = require("proxyquire").noCallThru();
    const { Orchestrator } = require("node-pluginsmanager-plugin");

    // locals
    const checkDirectory = require(join(__dirname, "..", "lib", "src", "checkers", "checkDirectory.ts"));
    const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
    const isDirectory = require(join(__dirname, "..", "lib", "src", "utils", "isDirectory.ts")).default;
    const rmdirp = require(join(__dirname, "..", "lib", "src", "utils", "rmdirp.ts")).default;

// const

    const MAX_TIMOUT = 30 * 1000;

    const PLUGINS_DIRECTORY = join(__dirname, "plugins");

        const TEST_PLUGIN_DIRECTORY = join(PLUGINS_DIRECTORY, "test-update");
            const TEST_PLUGIN_MODULES_DIRECTORY = join(TEST_PLUGIN_DIRECTORY, "node_modules");

    const EVENTS_DATA = "test";

// mock (avoids real GitHub / git pull / git directory check)

    function mockIsGitUsed () {
        return Promise.resolve(true);
    }

    function mockGitUpdate () {
        return Promise.resolve();
    }

    function mockGetLatestGithubTag () {
        return Promise.resolve({
            "name": "1.0.0",
            "commit": {
                "sha": "abc",
                "url": "test"
            },
            "tarball_url": "test",
            "zipball_url": "test",
            "node_id": "test"
        });
    }

    const MOCKS = {
        "./cmd/isGitUsed": {
            "__esModule": true,
            "default": mockIsGitUsed
        },
        "./cmd/git/gitUpdate": {
            "__esModule": true,
            "default": mockGitUpdate
        },
        "./utils/getLatestGithubTag": {
            "__esModule": true,
            "default": mockGetLatestGithubTag
        }
    };

    const PluginsManager = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), MOCKS).default;

// private

    function _pluginCacheKeys (directory) {

        return Object.keys(require.cache).filter((file) => {

            const fromDirectory = relative(directory, file);

            if ("" === fromDirectory) {
                return true;
            }

            return !fromDirectory.startsWith("..") && !isAbsolute(fromDirectory);

        });

    }

    function _releaseManager (manager, directory) {

        return manager.releaseAll().then(() => {
            return manager.destroyAll();
        }).then(() => {
            return rmdirp(directory);
        });

    }

// tests

describe("pluginsmanager / update via github", () => {

    const pluginsManager = new PluginsManager({
        "directory": PLUGINS_DIRECTORY,
        "logger": () => {
            // nothing to do here
        }
    });

    describe("params", () => {

        it("should test update without plugin", (done) => {

            pluginsManager.updateViaGithub().then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof ReferenceError, "Generated error is not an instance of Error");

                done();

            });

        });

        it("should test update with wrong plugin", (done) => {

            pluginsManager.updateViaGithub(false).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof TypeError, "Generated error is not an instance of Error");

                done();

            });

        });

        it("should test update with not loaded plugin", (done) => {

            const orchestrator = new Orchestrator({
                "externalResourcesDirectory": "",
                "packageFile": "",
                "descriptorFile": "",
                "mediatorFile": "",
                "serverFile": ""
            });

                orchestrator.name = basename(TEST_PLUGIN_DIRECTORY);
                orchestrator.repository = "whatever";

            pluginsManager.updateViaGithub(orchestrator).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");

                done();

            });

        });

    });

    describe("execute", () => {

        afterEach(() => {

            pluginsManager.removeAllListeners();

            return pluginsManager.releaseAll().then(() => {
                return pluginsManager.destroyAll();
            }).then(() => {
                return rmdirp(TEST_PLUGIN_MODULES_DIRECTORY);
            }).then(() => {
                return rmdirp(TEST_PLUGIN_DIRECTORY);
            });

        });

        it("should test update plugins and dependancies with \"repository\" parameter", () => {

            pluginsManager.on("updated", (plugin, data) => {

                strictEqual(typeof data, "string", "Events data is not a string");
                strictEqual(data, EVENTS_DATA, "Events data is not as expected");

                (0, console).log("--- [PluginsManager/events/updated] " + plugin.name + " - " + data);

            });

            const pluginName = basename(TEST_PLUGIN_DIRECTORY);
            let oldPlugin = null;
            let pluginsCountBeforeUpdate = 0;

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManager.loadAll();

            }).then(() => {

                pluginsCountBeforeUpdate = pluginsManager.plugins.length;
                ok(pluginsManager.getPluginsNames().includes(pluginName), "Distant plugin not installed");

                oldPlugin = pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null;

                return pluginsManager.updateViaGithub(oldPlugin, EVENTS_DATA);

            }).then((updatedPlugin) => {

                strictEqual(
                    pluginsManager.plugins.length, pluginsCountBeforeUpdate, "plugins length is incorrect after update"
                );
                ok(pluginsManager.getPluginsNames().includes(pluginName), "Updated plugin is not registered");
                ok(pluginsManager.getPluginsNames().includes("test-good-plugin"), "Other plugins were removed during update");

                const registeredPlugin = pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null;

                ok(oldPlugin !== registeredPlugin, "Updated plugin was not pushed as new instance");
                strictEqual(registeredPlugin, updatedPlugin, "Registered plugin is not the updated instance");

                return checkDirectory.default("update/execute", TEST_PLUGIN_MODULES_DIRECTORY);

            });

        }).timeout(MAX_TIMOUT);

        it("should test update plugins and dependancies with \"repository.url\" parameter", () => {

            const pluginName = basename(TEST_PLUGIN_DIRECTORY);
            let oldPlugin = null;
            let pluginsCountBeforeUpdate = 0;

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": {
                    "type": "git",
                    "url": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
                }
            }).then(() => {

                return pluginsManager.loadAll();

            }).then(() => {

                pluginsCountBeforeUpdate = pluginsManager.plugins.length;
                ok(pluginsManager.getPluginsNames().includes(pluginName), "Distant plugin not installed");

                oldPlugin = pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null;

                return pluginsManager.updateViaGithub(oldPlugin, EVENTS_DATA);

            }).then((updatedPlugin) => {

                strictEqual(
                    pluginsManager.plugins.length, pluginsCountBeforeUpdate, "plugins length is incorrect after update"
                );
                ok(pluginsManager.getPluginsNames().includes(pluginName), "Updated plugin is not registered");

                const registeredPlugin = pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null;

                ok(oldPlugin !== registeredPlugin, "Updated plugin was not pushed as new instance");
                strictEqual(registeredPlugin, updatedPlugin, "Registered plugin is not the updated instance");

                return checkDirectory.default("update/execute", TEST_PLUGIN_MODULES_DIRECTORY);

            });

        }).timeout(MAX_TIMOUT);

        it("should test update with missing repo", () => {

            const pluginName = basename(TEST_PLUGIN_DIRECTORY);

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "version": "0.0.1"
            }).then(() => {

                return pluginsManager.loadAll();

            }).then(() => {

                return pluginsManager.updateViaGithub(pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("invalid github project link"), "Generated error message is not as expected");

            });

        }).timeout(MAX_TIMOUT);

        it("should test update with invalid github link", () => {

            const pluginName = basename(TEST_PLUGIN_DIRECTORY);

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "whatever",
                "version": "0.0.1"
            }).then(() => {

                return pluginsManager.loadAll();

            }).then(() => {

                return pluginsManager.updateViaGithub(pluginsManager.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("invalid github project link"), "Generated error message is not as expected");

            });

        }).timeout(MAX_TIMOUT);

        it("should test update with already up to date plugin", () => {

            const PluginsManagerOutdated = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), {
                ...MOCKS,
                "./utils/getLatestGithubTag": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.resolve({
                            "name": "0.0.4",
                            "commit": {
                                "sha": "abc",
                                "url": "test"
                            },
                            "tarball_url": "test",
                            "zipball_url": "test",
                            "node_id": "test"
                        });
                    }
                }
            }).default;

            const pluginsManagerOutdated = new PluginsManagerOutdated({
                "directory": PLUGINS_DIRECTORY
            });

            const pluginName = basename(TEST_PLUGIN_DIRECTORY);

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManagerOutdated.loadAll();

            }).then(() => {

                return pluginsManagerOutdated.updateViaGithub(pluginsManagerOutdated.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("already up to date"), "Generated error message is not as expected");

            }).finally(() => {

                return pluginsManagerOutdated.releaseAll().then(() => {
                    return pluginsManagerOutdated.destroyAll();
                });

            });

        }).timeout(MAX_TIMOUT);

        it("should reject a plugin with no valid version", () => {

            const pluginName = "test-update-bad-version";

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test",
                "version": "not-a-version"
            }).then(() => {

                return pluginsManager.loadAll();

            }).then(() => {

                const plugin = pluginsManager.plugins.find((item) => {
                    return pluginName === item.name;
                });

                plugin.version = "not-a-version";

                return pluginsManager.updateViaGithub(plugin, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("no valid version"), "Generated error message is not as expected");

            }).finally(() => {

                return rmdirp(join(PLUGINS_DIRECTORY, pluginName));

            });

        }).timeout(MAX_TIMOUT);

        it("should reject a github tag that is not a version", () => {

            const PluginsManagerBadTag = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), {
                ...MOCKS,
                "./utils/getLatestGithubTag": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.resolve({
                            "name": "not-a-version",
                            "commit": {
                                "sha": "abc",
                                "url": "test"
                            },
                            "tarball_url": "test",
                            "zipball_url": "test",
                            "node_id": "test"
                        });
                    }
                }
            }).default;
            const pluginsManagerBadTag = new PluginsManagerBadTag({
                "directory": PLUGINS_DIRECTORY
            });
            const pluginName = "test-update-bad-tag";

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManagerBadTag.loadAll();

            }).then(() => {

                return pluginsManagerBadTag.updateViaGithub(pluginsManagerBadTag.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("No valid version found"), "Generated error message is not as expected");

            }).finally(() => {

                return rmdirp(join(PLUGINS_DIRECTORY, pluginName));

            });

        }).timeout(MAX_TIMOUT);

        it("should reinstall from github when the plugin directory is not a git repository", () => {

            let gitInstallCalled = false;
            const PluginsManagerNoGit = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), {
                ...MOCKS,
                "./cmd/isGitUsed": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.resolve(false);
                    }
                },
                "./cmd/git/gitInstall": {
                    "__esModule": true,
                    "default": () => {
                        gitInstallCalled = true;
                        return Promise.resolve();
                    }
                },
                "./utils/getLatestGithubTag": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.resolve({
                            "name": "9.9.9",
                            "commit": {
                                "sha": "abc",
                                "url": "test"
                            },
                            "tarball_url": "test",
                            "zipball_url": "test",
                            "node_id": "test"
                        });
                    }
                }
            }).default;
            const pluginsManagerNoGit = new PluginsManagerNoGit({
                "directory": PLUGINS_DIRECTORY
            });
            const pluginName = "test-update-without-git";

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManagerNoGit.loadAll();

            }).then(() => {

                return pluginsManagerNoGit.updateViaGithub(pluginsManagerNoGit.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                strictEqual(gitInstallCalled, true, "git install was not used");

            }).finally(() => {

                return rmdirp(join(PLUGINS_DIRECTORY, pluginName));

            });

        }).timeout(MAX_TIMOUT);

        it("should drop the plugin when the update fails after release", () => {

            let gitInstallCalled = false;
            const PluginsManagerFailed = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), {
                ...MOCKS,
                "./cmd/git/gitUpdate": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.reject(new Error("git update failed"));
                    }
                },
                "./cmd/git/gitInstall": {
                    "__esModule": true,
                    "default": (_directory, _user, repo) => {

                        gitInstallCalled = true;

                        return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", repo, {
                            "name": repo,
                            "dependencies": {}
                        });

                    }
                }
            }).default;
            const pluginsManagerFailed = new PluginsManagerFailed({
                "directory": PLUGINS_DIRECTORY
            });
            const pluginName = "test-update-failed-after";
            const directory = join(PLUGINS_DIRECTORY, pluginName);

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManagerFailed.loadAll();

            }).then(() => {

                ok(0 < _pluginCacheKeys(directory).length, "plugin was not loaded into require.cache");

                return pluginsManagerFailed.updateViaGithub(pluginsManagerFailed.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("git update failed"), "Generated error message is not as expected");
                ok(!pluginsManagerFailed.getPluginsNames().includes(pluginName), "plugin stayed registered");
                strictEqual(_pluginCacheKeys(directory).length, 0, "require.cache still holds the plugin");

                return isDirectory(directory);

            }).then((exists) => {

                strictEqual(exists, false, "plugin directory was not removed");

                return pluginsManagerFailed.installViaGithub("Psychopoulet", pluginName, EVENTS_DATA);

            }).then((plugin) => {

                strictEqual(gitInstallCalled, true, "install was rejected because the directory already exists");
                strictEqual(plugin.name, pluginName, "Installed plugin name is not as expected");
                strictEqual(plugin.constructor.name, "OrchestratorGoodPlugin", "Installed plugin was not loaded");
                ok(0 < _pluginCacheKeys(directory).length, "installed plugin was not loaded into require.cache");
                ok(pluginsManagerFailed.getPluginsNames().includes(pluginName), "Installed plugin is not registered");

            }).finally(() => {

                return _releaseManager(pluginsManagerFailed, directory);

            });

        }).timeout(MAX_TIMOUT);

        it("should keep the plugin when the update fails before release", () => {

            let gitInstallCalled = false;
            const PluginsManagerUpToDate = proxyquire(join(__dirname, "..", "lib", "src", "PluginsManager.ts"), {
                ...MOCKS,
                "./utils/getLatestGithubTag": {
                    "__esModule": true,
                    "default": () => {
                        return Promise.resolve({
                            "name": "0.0.4",
                            "commit": {
                                "sha": "abc",
                                "url": "test"
                            },
                            "tarball_url": "test",
                            "zipball_url": "test",
                            "node_id": "test"
                        });
                    }
                },
                "./cmd/git/gitInstall": {
                    "__esModule": true,
                    "default": () => {
                        gitInstallCalled = true;
                        return Promise.reject(new Error("git install reached"));
                    }
                }
            }).default;
            const pluginsManagerUpToDate = new PluginsManagerUpToDate({
                "directory": PLUGINS_DIRECTORY
            });
            const pluginName = "test-update-failed-before";
            const directory = join(PLUGINS_DIRECTORY, pluginName);

            return copyPlugin(PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName,
                "repository": "git://github.com/Psychopoulet/node-pluginsmanager-plugin-test"
            }).then(() => {

                return pluginsManagerUpToDate.loadAll();

            }).then(() => {

                ok(0 < _pluginCacheKeys(directory).length, "plugin was not loaded into require.cache");

                return pluginsManagerUpToDate.updateViaGithub(pluginsManagerUpToDate.plugins.find((plugin) => {
                    return pluginName === plugin.name;
                }) || null, EVENTS_DATA);

            }).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an instance of Error");
                ok(-1 < err.message.indexOf("already up to date"), "Generated error message is not as expected");
                ok(pluginsManagerUpToDate.getPluginsNames().includes(pluginName), "plugin was removed from the list");
                ok(0 < _pluginCacheKeys(directory).length, "require.cache lost the plugin");

                return isDirectory(directory);

            }).then((exists) => {

                strictEqual(exists, true, "plugin directory was removed");

                return pluginsManagerUpToDate.installViaGithub("Psychopoulet", pluginName).then(() => {
                    throw new Error("install was not rejected");
                }, (installErr) => {

                    strictEqual(gitInstallCalled, false, "install passed the existing directory");
                    ok(-1 < installErr.message.indexOf("plugin already exists"), "install was not rejected because the directory already exists");

                });

            }).finally(() => {

                return _releaseManager(pluginsManagerUpToDate, directory);

            });

        }).timeout(MAX_TIMOUT);

    });

});
