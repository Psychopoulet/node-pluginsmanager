// deps

    // locals
    import cmd from "../cmd";

// module

export default function npmBuild (directory: string): Promise<void> {

    return cmd(directory, "npm", [ "run", "build" ]);

}
