// deps

    // locals
    import checkDirectory from "../../checkers/checkDirectory";
    import cmd from "../cmd";

// module

export default function npmCmd (directory: string, params: string[]): Promise<void> {

    return checkDirectory("cmd/npm/cmd/directory", directory).then((): Promise<void> => {

        // npm install
        return cmd(directory, (/^win/).test(process.platform) ? "npm.cmd" : "npm", params);

    });

}
