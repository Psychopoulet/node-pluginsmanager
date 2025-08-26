// deps

    // locals
    import cmd from "../cmd";

// module

export default function npmUpdate (directory: string): Promise<void> {
    return cmd(directory, "npm", [ "update", "--omit=dev", "--no-optional" ]);
}
