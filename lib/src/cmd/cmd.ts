// deps

    // natives
    import { spawn } from "node:child_process";

    // locals
    import checkDirectory from "../checkers/checkDirectory";
    import checkNonEmptyArray from "../checkers/checkNonEmptyArray";
    import checkNonEmptyString from "../checkers/checkNonEmptyString";
    import stdToString from "./stdToString";

// types & interfaces

    // natives
    import type { ChildProcessWithoutNullStreams } from "node:child_process";

// module

export default function cmd (directory: string, command: string, params: string[]): Promise<void> {

    return checkDirectory("cmd/directory", directory).then((): Promise<void> => {
        return checkNonEmptyString("cmd/command", command);
    }).then((): Promise<void> => {
        return checkNonEmptyArray("cmd/params", params);
    }).then((): Promise<void> => {

        return new Promise((resolve: () => void, reject: (err: Error) => void): void => {

            let errMsg: string = "";
            let outMsg: string = "";
            const mySpawn: ChildProcessWithoutNullStreams = spawn(command, params, {
                "cwd": directory,
                "windowsHide": true,
                "shell": true
            }).on("error", (err: Error): void => {
                errMsg += stdToString(err);
            }).on("close", (code: number): void => {

                if (0 < errMsg.length) {
                    return code ? reject(new Error(errMsg)) : resolve();
                }

                return code ? reject(new Error(outMsg)) : resolve();

            });

            mySpawn.stdout.setEncoding("utf8");
            mySpawn.stdout.on("data", (msg: string): void => {
                outMsg += stdToString(msg);
            });

            mySpawn.stderr.setEncoding("utf8");
            mySpawn.stderr.on("data", (msg: string): void => {
                errMsg += stdToString(msg);
            });

        });

    });

}
