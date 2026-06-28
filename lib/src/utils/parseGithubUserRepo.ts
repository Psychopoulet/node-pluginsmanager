// types & interfaces

    // locals

    export interface GithubUserRepo {
        "user": string;
        "repo": string;
    }

// module

export default function parseGithubUserRepo (github: string): GithubUserRepo | null {

    if ("string" !== typeof github) {
        return null;
    }

    const githubUrlPattern: RegExp = /(?:github\.com[/:]|@github\.com:)([^/]+)\/([^/.]+)/i;
    const userRepoPattern: RegExp = /^([^/]+)\/([^/]+)$/;

    let match: RegExpExecArray | null = githubUrlPattern.exec(github);

    match ??= userRepoPattern.exec(github);

    if (!match) {
        return null;
    }

    return {
        "user": match[1],
        "repo": match[2].replace(/\.git$/i, "")
    };

}
