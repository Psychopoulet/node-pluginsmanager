// deps

    // natives
    import { lstat } from "node:fs";

// types & interfaces

    // natives
    import type { Stats } from "node:fs";

// module

export default function isFile (directory: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

        if ("undefined" === typeof directory) {
            reject(new ReferenceError("missing \"directory\" argument"));
        }
            else if ("string" !== typeof directory) {
                reject(new TypeError("\"directory\" argument is not a string"));
            }
            else if ("" === directory.trim()) {
                reject(new RangeError("\"directory\" argument is empty"));
            }
        else {

            lstat(directory, (err: Error | null, stats: Stats): void => {
                return resolve(Boolean(!err && stats.isFile()));
            });

        }

    });

}
