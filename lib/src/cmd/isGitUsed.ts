// deps

    // natives
    import { join } from "node:path";

    // locals
    import cmd from "./cmd";
    import isDirectory from "../utils/isDirectory";

// module

export default function isGitUsed (directory: string): Promise<boolean> {

    return isDirectory(join(directory, ".git")).then((check: boolean): Promise<boolean> => {

        if (!check) {
            return Promise.resolve(false);
        }

        return new Promise((resolve: (value: boolean) => void): void => {

            cmd(directory, "git", [ "fetch" ]).then(() => {
                resolve(true);
            }).catch(() => {
                resolve(false);
            });

        });

    });

}
