// deps

    // locals
    import checkDirectory from "../../checkers/checkDirectory";
    import checkNonEmptyString from "../../checkers/checkNonEmptyString";
    import cmd from "../cmd";

// module

export default function gitUpdate (directory: string, tag?: string): Promise<void> {

    return checkDirectory("cmd/git/update/directory", directory).then((): Promise<void> => {

        // pull latest changes from remote repository

        if ("string" !== typeof tag) {
            return cmd(directory, "git", [ "pull" ]);
        }

        // OR fetch specific tag from remote repository

        return checkNonEmptyString("cmd/git/update/tag", tag).then((): Promise<void> => {

            return cmd(directory, "git", [
                "fetch",
                "origin",
                "tag",
                tag,
                "--depth",
                "1"
            ]).then((): Promise<void> => {

                return cmd(directory, "git", [ "checkout", tag ]);

            });

        });

    });

}
