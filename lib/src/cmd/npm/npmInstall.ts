// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // locals
    import cmd from "../cmd";

// private

    // methods
    function _hasInstallScripts (packageData: Record<string, unknown>): boolean {

        if ("object" !== typeof packageData.scripts || null === packageData.scripts) {
            return false;
        }

        const scripts: Record<string, unknown> = packageData.scripts as Record<string, unknown>;
        const installDev: unknown = scripts["install-dev"];
        const installProd: unknown = scripts["install-prod"];

        if ("string" !== typeof installDev || "string" !== typeof installProd) {
            return false;
        }

        return "" !== installDev.trim() && "" !== installProd.trim();

    }

// module

export default function npmInstall (directory: string, isBuildMode: boolean = false): Promise<void> {

    return readFile(join(directory, "package.json"), "utf-8").then((content: string): Promise<void> => {

        const packageData: Record<string, unknown> = JSON.parse(content) as Record<string, unknown>;

        if (_hasInstallScripts(packageData)) {

            return cmd(directory, "npm", [
                "run",
                isBuildMode ? "install-dev" : "install-prod"
            ]);

        }

        const flags: string[] = isBuildMode ? [ "--omit=optional" ] : [ "--omit=dev", "--omit=optional" ];

        return cmd(directory, "npm", [
            "install",
            ...flags
        ]).then((): Promise<void> => {

            return cmd(directory, "npm", [
                "audit",
                "fix",
                ...flags
            ]);

        });

    });

}
