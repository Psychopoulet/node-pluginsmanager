// deps

    // natives
    import { join } from "node:path";

    // locals
    import cmd from "./cmd";
    import isDirectory from "../utils/isDirectory";

// module

export default function isGitUsed (directory: string): Promise<boolean> {

    return isDirectory(join(directory, ".git")).then((check: boolean): Promise<boolean> | boolean => {

        if (!check) {
            return false;
        }

        return new Promise((resolve: (value: boolean) => void): void => {

            cmd(directory, "git", [
                "rev-parse",
                "-q",
                "--verify",
                "HEAD"
            ]).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });

        });

    });

}
