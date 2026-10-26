// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { mkdir, mkdtemp, rm, writeFile } = require("node:fs/promises");
    const { homedir, tmpdir } = require("node:os");
    const { basename, join } = require("node:path");

    // externals
    const { Orchestrator } = require("node-pluginsmanager-plugin");

    // locals
    const copyPlugin = require(join(__dirname, "utils", "copyPlugin.js"));
    const createPluginByDirectory = require(join(__dirname, "..", "lib", "src", "createPluginByDirectory.ts"));

// consts

    const TESTS_PLUGINS_DIRECTORY = join(__dirname, "plugins");

        const NOT_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestNotPlugin");
        const INVALID_NAME_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "TestInvalidNamePlugin");
        const GOOD_PLUGIN = join(TESTS_PLUGINS_DIRECTORY, "test-good-plugin");

    const TESTS_EXTERNAL_RESOURCES_DIRECTORY = join(homedir(), "node-pluginsmanager-plugins-resources");

// tests

describe("createPluginByDirectory", () => {

    before(() => {

        return mkdir(NOT_PLUGIN, {
            "recursive": true
        }).then(() => {

            return mkdir(INVALID_NAME_PLUGIN, {
                "recursive": true
            });

        }).then(() => {

            return mkdir(TESTS_EXTERNAL_RESOURCES_DIRECTORY, {
                "recursive": true
            });

        });

    });

    after(() => {

        return rm(NOT_PLUGIN, {
            "recursive": true
        }).then(() => {

            return rm(INVALID_NAME_PLUGIN, {
                "recursive": true
            });

        }).then(() => {

            return rm(TESTS_EXTERNAL_RESOURCES_DIRECTORY, {
                "recursive": true
            });

        });

    });

    describe("params", () => {

        describe("directory", () => {

            it("should test no directory", (done) => {

                createPluginByDirectory.default().then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof ReferenceError, "Generated error is not an Error");

                    done();

                });

            });

            it("should test wrong directory", (done) => {

                createPluginByDirectory.default(false).then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof TypeError, "Generated error is not an Error");

                    done();

                });

            });

            it("should test empty directory", (done) => {

                createPluginByDirectory.default("").then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

            it("should test wrong directory", (done) => {

                createPluginByDirectory.default(join(__dirname, "oqnzoefnzeofn")).then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

            it("should test relative directory", (done) => {

                createPluginByDirectory.default(".").then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

        });

        describe("externalResourcesDirectory", () => {

            it("should test no directory", (done) => {

                createPluginByDirectory.default(__dirname).then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof ReferenceError, "Generated error is not an Error");

                    done();

                });

            });

            it("should test wrong directory", (done) => {

                createPluginByDirectory.default(__dirname, false).then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof TypeError, "Generated error is not an Error");

                    done();

                });

            });

            it("should test empty directory", (done) => {

                createPluginByDirectory.default(__dirname, "").then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

            it("should test wrong directory", (done) => {

                createPluginByDirectory.default(__dirname, join(__dirname, "oqnzoefnzeofn")).then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

            it("should test relative directory", (done) => {

                createPluginByDirectory.default(__dirname, ".").then(() => {
                    done(new Error("There is no generated error"));
                }).catch((err) => {

                    strictEqual(typeof err, "object", "Generated error is not an object");
                    ok(err instanceof Error, "Generated error is not an Error");

                    done();

                });

            });

        });

    });

    describe("execute", () => {

        it("should test not plugin directory", (done) => {

            writeFile(
                join(NOT_PLUGIN, "package.json"),
                JSON.stringify({
                    "name": "test",
                    "main": "TestNotPlugin.js"
                }),
                "utf8"
            ).then(() => {

                return writeFile(
                    join(NOT_PLUGIN, "TestNotPlugin.js"),
                    "// nothing to do here",
                    "utf8"
                );

            }).then(() => {
                return createPluginByDirectory.default(NOT_PLUGIN, TESTS_EXTERNAL_RESOURCES_DIRECTORY);
            }).then(() => {
                done(new Error("There is no generated error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an Error");

                done();

            });

        });

        it("should test with plugin with invalid name", (done) => {

            const pluginName = basename(INVALID_NAME_PLUGIN);

            copyPlugin(TESTS_PLUGINS_DIRECTORY, GOOD_PLUGIN, pluginName, {
                "name": "test"
            }).then(() => {
                return createPluginByDirectory.default(INVALID_NAME_PLUGIN, TESTS_EXTERNAL_RESOURCES_DIRECTORY);
            }).then(() => {
                done(new Error("There is no generated error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an Error");

                done();

            });

        });

        it("should test plugin directory", () => {

            return createPluginByDirectory.default(GOOD_PLUGIN, TESTS_EXTERNAL_RESOURCES_DIRECTORY).then((plugin) => {

                strictEqual(typeof plugin, "object", "Generated plugin is not an object");
                ok(plugin instanceof Orchestrator, "Generated plugin is not an Orchestrator");

            });

        });

        it("should reject a module that throws a non-error", () => {

            let root = "";

            return mkdtemp(join(tmpdir(), "pluginsmanager-throw-")).then((dir) => {

                root = dir;

                return writeFile(join(dir, "package.json"), JSON.stringify({
                    "name": "boom",
                    "main": "boom.js"
                }), "utf-8");

            }).then(() => {

                return writeFile(join(root, "boom.js"), "throw \"boom\";\n", "utf-8");

            }).then(() => {

                return createPluginByDirectory.default(root, TESTS_EXTERNAL_RESOURCES_DIRECTORY);

            }).then(() => {
                throw new Error("There is no generated error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an Error");
                ok(-1 < err.message.indexOf("boom"), "Generated error message is not as expected");

            }).finally(() => {

                return root ? rm(root, {
                    "recursive": true,
                    "force": true
                }) : Promise.resolve();

            });

        });

        it("should reject a module that throws an error", () => {

            let root = "";

            return mkdtemp(join(tmpdir(), "pluginsmanager-throw-error-")).then((dir) => {

                root = dir;

                return writeFile(join(dir, "package.json"), JSON.stringify({
                    "name": "boom",
                    "main": "boom.js"
                }), "utf-8");

            }).then(() => {

                return writeFile(join(root, "boom.js"), "throw new Error(\"boom-error\");\n", "utf-8");

            }).then(() => {

                return createPluginByDirectory.default(root, TESTS_EXTERNAL_RESOURCES_DIRECTORY);

            }).then(() => {
                throw new Error("There is no generated error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an Error");
                ok(-1 < err.message.indexOf("boom-error"), "Generated error message is not as expected");

            }).finally(() => {

                return root ? rm(root, {
                    "recursive": true,
                    "force": true
                }) : Promise.resolve();

            });

        });

        it("should reject a plugin whose loaded name does not match its directory", () => {

            const pluginName = "renamed-plugin";
            const pluginDirectory = join(TESTS_PLUGINS_DIRECTORY, pluginName);

            return copyPlugin(TESTS_PLUGINS_DIRECTORY, "test-good-plugin", pluginName, {
                "name": pluginName
            }).then(() => {

                return writeFile(join(pluginDirectory, "Orchestrator.js"), [
                    "const { join } = require(\"node:path\");",
                    "const { Orchestrator } = require(\"node-pluginsmanager-plugin\");",
                    "module.exports = class OrchestratorGoodPlugin extends Orchestrator {",
                    "    constructor (options) {",
                    "        const opt = options || {};",
                    "        opt.packageFile = join(__dirname, \"package.json\");",
                    "        opt.descriptorFile = join(__dirname, \"Descriptor.json\");",
                    "        opt.mediatorFile = join(__dirname, \"Mediator.js\");",
                    "        opt.serverFile = join(__dirname, \"Server.js\");",
                    "        super(opt);",
                    "    }",
                    "    load () {",
                    "        this.name = \"not-the-directory\";",
                    "        return Promise.resolve();",
                    "    }",
                    "};",
                    ""
                ].join("\n"), "utf-8");

            }).then(() => {

                return createPluginByDirectory.default(pluginDirectory, TESTS_EXTERNAL_RESOURCES_DIRECTORY);

            }).then(() => {
                throw new Error("There is no generated error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "Generated error is not an object");
                ok(err instanceof Error, "Generated error is not an Error");
                ok(-1 < err.message.indexOf("does not fit"), "Generated error message is not as expected");

            }).finally(() => {

                return rm(pluginDirectory, {
                    "recursive": true,
                    "force": true
                });

            });

        });

    });

});
