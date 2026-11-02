// deps

    // natives
    const { deepStrictEqual, strictEqual } = require("node:assert");
    const { mkdir, mkdtemp, writeFile, rm } = require("node:fs/promises");
    const { homedir, tmpdir } = require("node:os");
    const { join } = require("node:path");

    // externals
    const proxyquire = require("proxyquire").noCallThru();

    // locals

    const NPM_DIRECTORY = join(__dirname, "..", "lib", "src", "cmd", "npm");

        const install = require(join(NPM_DIRECTORY, "npmInstall.ts"));
        const update = require(join(NPM_DIRECTORY, "npmUpdate.ts"));

// const

    const MAX_TIMOUT = 30 * 1000;

    const PLUGINS_DIRECTORY = join(homedir(), "node-pluginsmanager");

    const INSTALL_BUILD = [
        "install",
        "--omit=optional"
    ];
    const AUDIT_BUILD = [
        "audit",
        "fix",
        "--omit=optional"
    ];
    const INSTALL_PROD = [
        "install",
        "--omit=dev",
        "--omit=optional"
    ];
    const AUDIT_PROD = [
        "audit",
        "fix",
        "--omit=dev",
        "--omit=optional"
    ];

// mock

    const _calls = [];

    function _mockCmd (directory, command, params) {

        _calls.push({
            "directory": directory,
            "command": command,
            "params": params
        });

        return Promise.resolve();

    }

    const npmInstall = proxyquire(join(NPM_DIRECTORY, "npmInstall.ts"), {
        "../cmd": {
            "__esModule": true,
            "default": _mockCmd
        }
    }).default;

// private

    function _run (packageJson, isBuildMode) {

        _calls.length = 0;

        return mkdtemp(join(tmpdir(), "pluginsmanager-npminstall-")).then((directory) => {

            return writeFile(join(directory, "package.json"), JSON.stringify(packageJson), "utf-8").then(() => {
                return npmInstall(directory, isBuildMode);
            }).then(() => {

                return _calls.map((call) => {

                    strictEqual(call.directory, directory);
                    strictEqual(call.command, "npm");

                    return call.params;

                });

            }).finally(() => {

                return rm(directory, {
                    "recursive": true,
                    "force": true
                });

            });

        });

    }

    function _expect (packageJson, isBuildMode, expected) {

        return _run(packageJson, isBuildMode).then((params) => {
            deepStrictEqual(params, expected);
        });

    }

// tests

describe("cmd / npm", () => {

    before(() => {

        return mkdir(PLUGINS_DIRECTORY, {
            "recursive": true
        }).then(() => {

            return writeFile(join(PLUGINS_DIRECTORY, "package.json"), JSON.stringify({
                "dependencies": {
                    "node-promfs": "3.6.2"
                }
            }), "utf-8");

        });

    });

    after(() => {

        return rm(PLUGINS_DIRECTORY, {
            "recursive": true
        });

    });

    it("should test right install", () => {
        return install.default(PLUGINS_DIRECTORY).catch((err) => {
            console.log(err);
            return Promise.reject(err);
        });
    }).timeout(MAX_TIMOUT);

    it("should test right update", () => {
        return update.default(PLUGINS_DIRECTORY);
    }).timeout(MAX_TIMOUT);

});

describe("cmd / npm / npmInstall", () => {

    describe("both scripts", () => {

        const packageJson = {
            "scripts": {
                "install-dev": "echo dev",
                "install-prod": "echo prod"
            }
        };

        it("should run install-dev in build mode", () => {
            return _expect(packageJson, true, [ [ "run", "install-dev" ] ]);
        });

        it("should run install-prod otherwise", () => {
            return _expect(packageJson, false, [ [ "run", "install-prod" ] ]);
        });

    });

    describe("one script", () => {

        it("should install and audit fix in build mode", () => {

            return _expect({
                "scripts": {
                    "install-dev": "echo dev"
                }
            }, true, [
                INSTALL_BUILD,
                AUDIT_BUILD
            ]);

        });

        it("should install and audit fix otherwise", () => {

            return _expect({
                "scripts": {
                    "install-prod": "echo prod"
                }
            }, false, [
                INSTALL_PROD,
                AUDIT_PROD
            ]);

        });

    });

    describe("empty script", () => {

        it("should install and audit fix in build mode", () => {

            return _expect({
                "scripts": {
                    "install-dev": "",
                    "install-prod": "echo prod"
                }
            }, true, [
                INSTALL_BUILD,
                AUDIT_BUILD
            ]);

        });

        it("should install and audit fix otherwise", () => {

            return _expect({
                "scripts": {
                    "install-dev": "echo dev",
                    "install-prod": "   "
                }
            }, false, [
                INSTALL_PROD,
                AUDIT_PROD
            ]);

        });

    });

    describe("no scripts object", () => {

        it("should install and audit fix in build mode", () => {

            return _expect({
                "dependencies": {
                    "node-promfs": "3.6.2"
                }
            }, true, [
                INSTALL_BUILD,
                AUDIT_BUILD
            ]);

        });

        it("should install and audit fix otherwise", () => {
            return _expect({}, false, [
                INSTALL_PROD,
                AUDIT_PROD
            ]);
        });

        it("should install and audit fix when scripts is null", () => {

            return _expect({
                "scripts": null
            }, false, [
                INSTALL_PROD,
                AUDIT_PROD
            ]);

        });

    });

});
