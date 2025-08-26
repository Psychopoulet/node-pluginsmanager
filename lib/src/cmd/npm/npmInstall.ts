// deps

    // locals
    import cmd from "../cmd";

// module

export default function npmInstall (directory: string): Promise<void> {

    return cmd(directory, "npm", [
        "install",
        "--omit=dev",
        "--no-optional"
    ]);

}
