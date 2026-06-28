// deps

    // locals
    import checkNonEmptyString from "../checkers/checkNonEmptyString";

// types & interfaces

    // locals

    export interface GithubTag {
        "name": string;
        "commit": {
            "sha": string;
            "url": string;
        };
        "tarball_url": string;
        "zipball_url": string;
        "node_id": string;
    }

// module

export default function getLatestGithubTag (user: string, repo: string): Promise<GithubTag> {

    return checkNonEmptyString("utils/getLatestGithubTag/user", user).then((): Promise<void> => {
        return checkNonEmptyString("utils/getLatestGithubTag/repo", repo);
    }).then((): Promise<GithubTag> => {

        const url: string = "https://api.github.com/repos/" + user + "/" + repo + "/tags";
        const method: string = "GET";

        return fetch(url, {
            "method": method,
            "headers": {
                "Content-Type": "application/json"
            }
        }).then((res: Response): Promise<GithubTag[]> => {

            if (res.ok) {
                return res.json();
            }
            else {
                throw new Error("Failed to fetch '" + url + "': " + res.statusText);
            }

        }).then((data: GithubTag[]): GithubTag => {

            if (0 >= data.length) {
                throw new Error("No tags found for '" + url + "'");
            }

            return data[0];

        });

    });

}
