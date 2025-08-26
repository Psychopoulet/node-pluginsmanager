// deps

    // locals
    import npmCmd from "./npmCmd";

// module

export default function npmUpdate (directory: string): Promise<void> {
    return npmCmd(directory, [ "update", "--prod" ]);
}
