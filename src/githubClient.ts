import { readFileSync } from "fs";
import { Octokit, } from "octokit";
import * as util from './util';

/**
 * Wrapper for the octokit github client implementation. Used to download repos from github.
 */
export class GithubClient {
    private octokit: Octokit;

    constructor(tokenUrl: string) {
        try {
            const accessToken = readFileSync(tokenUrl, 'utf8');
            this.octokit = new Octokit({ auth: accessToken });
        } catch (err) {
            console.error('Authentication with access-token failed.');
            throw err;
        }
    }

    /**
     * Downloads the github repo with the given url.
     * @param url The repo url.
     * @param logger The logger instance.
     * @returns The content of the repo.
     */
    async downloadRepo(url: string): Promise<unknown> {
        let repoInfo = util.filterRepoInfoFromURL(url);
        let repoOwner = repoInfo[0];
        let repoName = repoInfo[1];
        try {
            let repoContent = this.octokit.rest.repos.getContent({
                owner: repoOwner,
                repo: repoName,
                path: ''
            });
            return repoContent;
        } catch (err) {
            if (err.status == '404') {
                throw `Repository with URL ${url} not found.`;
            } else {
                throw err;
            }
        }
    }
}
