// deps

    // locals
    import cmd from "../cmd";

// module

export default function npmInstall (directory: string, isBuildMode: boolean = false): Promise<void> {

    return cmd(directory, "npm", [
        "install",
        ...(isBuildMode ? [ "--no-optional" ] : [ "--omit=dev", "--no-optional" ])
    ]);

}
