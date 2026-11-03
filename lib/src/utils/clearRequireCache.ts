// deps

    // natives
    import { isAbsolute, relative } from "node:path";

// private

    // methods
    function _isUnderDirectory (directory: string, file: string): boolean {

        const fromDirectory: string = relative(directory, file);

        if ("" === fromDirectory) {
            return true;
        }

        return !fromDirectory.startsWith("..") && !isAbsolute(fromDirectory);

    }

// module

export default function clearRequireCache (directory: string): void {

    for (const file of Object.keys(require.cache)) {

        if (_isUnderDirectory(directory, file)) {
            Reflect.deleteProperty(require.cache, file);
        }

    }

}
