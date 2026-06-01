// deps

    // locals
    import checkNonEmptyString from "./checkNonEmptyString";
    import isDirectory from "../utils/isDirectory";

// module

export default function checkDirectory (dataName: string, directory: string): Promise<void> {

    return checkNonEmptyString(dataName, directory).then((): Promise<boolean> => {

        return isDirectory(directory);

    }).then((exists: boolean): Promise<void> => {

        return exists ? Promise.resolve() : Promise.reject(new Error(
            "\"" + dataName + "\" (" + directory + ") is not a valid directory"
        ));

    });

}
