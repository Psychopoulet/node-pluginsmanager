// deps

    // natives
    const { ok, strictEqual } = require("node:assert");
    const { EventEmitter } = require("node:events");
    const childProcess = require("node:child_process");
    const { join } = require("node:path");

    // locals
    const cmd = require(join(__dirname, "..", "lib", "src", "cmd", "cmd.ts"));

// tests

describe("cmd / cmd", () => {

    describe("directory", () => {

        it("should test without directory", (done) => {

            cmd.default().then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof ReferenceError, "generated error is not as expected");

                done();

            });

        });

        it("should test wrong directory", (done) => {

            cmd.default(false).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof TypeError, "generated error is not as expected");

                done();

            });

        });

        it("should test empty directory", (done) => {

            cmd.default("").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof RangeError, "generated error is not as expected");

                done();

            });

        });

        it("should test invalid directory", (done) => {

            cmd.default(join(__dirname, "sifnzsoifgevnzoeifnz")).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

                done();

            });

        });

    });

    describe("command", () => {

        it("should test missing command", (done) => {

            cmd.default("test").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof ReferenceError, "generated error is not as expected");

                done();

            });

        });

        it("should test wrong command", (done) => {

            cmd.default("test", false).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof TypeError, "generated error is not as expected");

                done();

            });

        });

        it("should test empty command", (done) => {

            cmd.default("test", "").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof RangeError, "generated error is not as expected");

                done();

            });

        });

    });

    describe("command", () => {

        it("should test missing params", (done) => {

            cmd.default("test", "test").then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof ReferenceError, "generated error is not as expected");

                done();

            });

        });

        it("should test wrong params", (done) => {

            cmd.default("test", "test", false).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof TypeError, "generated error is not as expected");

                done();

            });

        });

        it("should test empty params", (done) => {

            cmd.default("test", "test", []).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof RangeError, "generated error is not as expected");

                done();

            });

        });

    });

    describe("execute", () => {

        it("should test wrong command", (done) => {

            cmd.default("./", "node", [ "-tzfzefzef" ]).then(() => {
                done(new Error("tests does not generate error"));
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

                done();

            });

        });

        it("should test node version", () => {

            return cmd.default("./", "node", [ "-v" ]);

        });

        it("should reject when the process cannot be spawned", () => {

            const originalSpawn = childProcess.spawn;

            childProcess.spawn = () => {

                const child = new EventEmitter();

                child.stdout = new EventEmitter();
                child.stderr = new EventEmitter();
                child.stdout.setEncoding = () => {
                    // nothing to do here
                };
                child.stderr.setEncoding = () => {
                    // nothing to do here
                };

                process.nextTick(() => {
                    child.emit("error", new Error("spawn failed"));
                    child.emit("close", 1);
                });

                return child;

            };

            return cmd.default(join(__dirname, ".."), "node", [ "-v" ]).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");

            }).finally(() => {
                childProcess.spawn = originalSpawn;
            });

        });

        it("should reject a failing command that writes to stdout", () => {

            const originalSpawn = childProcess.spawn;

            childProcess.spawn = () => {

                const child = new EventEmitter();

                child.stdout = new EventEmitter();
                child.stderr = new EventEmitter();
                child.stdout.setEncoding = () => {
                    // nothing to do here
                };
                child.stderr.setEncoding = () => {
                    // nothing to do here
                };

                process.nextTick(() => {
                    child.stdout.emit("data", "fail");
                    child.emit("close", 1);
                });

                return child;

            };

            return cmd.default(join(__dirname, ".."), "node", [ "-v" ]).then(() => {
                throw new Error("tests does not generate error");
            }).catch((err) => {

                strictEqual(typeof err, "object", "generated error is not as expected");
                ok(err instanceof Error, "generated error is not as expected");
                ok(-1 < err.message.indexOf("fail"), "generated error message is not as expected");

            }).finally(() => {
                childProcess.spawn = originalSpawn;
            });

        });

        it("should resolve when a spawn error is followed by a zero exit code", () => {

            const originalSpawn = childProcess.spawn;

            childProcess.spawn = () => {

                const child = new EventEmitter();

                child.stdout = new EventEmitter();
                child.stderr = new EventEmitter();
                child.stdout.setEncoding = () => {
                    // nothing to do here
                };
                child.stderr.setEncoding = () => {
                    // nothing to do here
                };

                process.nextTick(() => {
                    child.emit("error", new Error("spawn failed"));
                    child.emit("close", 0);
                });

                return child;

            };

            return cmd.default(join(__dirname, ".."), "node", [ "-v" ]).finally(() => {
                childProcess.spawn = originalSpawn;
            });

        });

    });

});
