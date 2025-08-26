// deps

    // natives
    import { rm } from "node:fs/promises";

    // locals
    import isDirectory from "./isDirectory";

// module

export default function rmdirp (directory: string): Promise<void> {

    return isDirectory(directory).then((exists: boolean): Promise<void> => {

        return exists ? rm(directory, {
            "recursive": true
        }) : Promise.resolve();

    });

}
